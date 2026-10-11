import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  const { id, noteId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "EDIT_APPLICANT_PROFILE");
  if (guard) return guard;

  const { body } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "Note body required" }, { status: 400 });
  }

  const note = await prisma.note.findUnique({ where: { id: noteId, applicationId: id } });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (note.authorId !== session!.user.id) {
    return NextResponse.json({ error: "You can only edit your own notes." }, { status: 403 });
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: { body },
    include: { author: { select: { firstName: true, lastName: true } } },
  });

  await logAudit({
    applicationId: id,
    objectType: "Note",
    objectId: noteId,
    action: "UPDATE",
    actionDetail: "Staff edited an internal note",
    userId: session!.user.id,
  });

  return NextResponse.json({ note: updated });
}
