import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
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

  return NextResponse.json({ success: true });
}
