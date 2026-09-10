import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { notifyStudentOfDocumentRejection } from "@/lib/notifications";
import { createTimelineEvent } from "@/lib/timeline";
import { getStorageProvider } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "VERIFY_DOCUMENTS");
  if (guard) return guard;

  const { action, verificationNote } = await req.json();

  if (!["verify", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({ where: { id: docId, applicationId: id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = action === "verify" ? "VERIFIED" : "REJECTED";

  await prisma.document.update({
    where: { id: docId },
    data: {
      status: newStatus,
      verificationNote,
      verifiedById: action === "verify" ? session!.user.id : null,
    },
  });

  await logAudit({
    applicationId: id,
    objectType: "Document",
    objectId: docId,
    action: "UPDATE",
    actionDetail: `Document "${doc.filename}" ${action === "verify" ? "verified" : "rejected"}${verificationNote ? ` — ${verificationNote}` : ""}`,
    userId: session!.user.id,
  });

  await createTimelineEvent({
    applicationId: id,
    eventType: "DOCUMENT_VERIFIED",
    title: `Document ${action === "verify" ? "verified" : "rejected"}: ${doc.filename}`,
    description: verificationNote || undefined,
    isVisibleToStudent: true,
    relatedDocumentId: docId,
    createdById: session!.user.id,
  });

  if (action === "reject") {
    await notifyStudentOfDocumentRejection(id, doc.filename, verificationNote ?? null);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; docId: string }> }) {
  const { id, docId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "DELETE_DOCUMENTS");
  if (guard) return guard;

  const doc = await prisma.document.findUnique({ where: { id: docId, applicationId: id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.document.delete({ where: { id: docId } });

  const storage = getStorageProvider();
  await storage.delete(doc.storageKey);

  await logAudit({
    applicationId: id,
    objectType: "Document",
    objectId: docId,
    action: "DELETE",
    actionDetail: `Document "${doc.filename}" deleted`,
    userId: session!.user.id,
  });

  return NextResponse.json({ success: true });
}
