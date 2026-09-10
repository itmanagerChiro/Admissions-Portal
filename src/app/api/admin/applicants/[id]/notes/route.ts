import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "VIEW_APPLICANTS");
  if (guard) return guard;

  const notes = await prisma.note.findMany({
    where: { applicationId: id },
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "EDIT_APPLICANT_PROFILE");
  if (guard) return guard;

  const { body } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "Note body required" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({ where: { id }, select: { id: true } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const note = await prisma.note.create({
    data: { applicationId: id, body, authorId: session!.user.id },
    include: { author: { select: { firstName: true, lastName: true } } },
  });

  await logAudit({
    applicationId: id,
    objectType: "Note",
    objectId: note.id,
    action: "CREATE",
    actionDetail: "Staff added an internal note",
    userId: session!.user.id,
  });

  return NextResponse.json({ note }, { status: 201 });
}
