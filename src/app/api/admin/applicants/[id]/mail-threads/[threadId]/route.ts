import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; threadId: string }> }) {
  const { id, threadId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "VIEW_ALL_MESSAGES");
  if (guard) return guard;

  const thread = await prisma.mailThread.findFirst({
    where: { id: threadId, applicationId: id },
    include: {
      messages: { orderBy: { sentAt: "asc" }, include: { sender: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mailMessage.updateMany({
    where: { threadId, senderRole: "STUDENT", isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return NextResponse.json(thread);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; threadId: string }> }) {
  const { id, threadId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "SEND_MESSAGES");
  if (guard) return guard;

  const thread = await prisma.mailThread.findFirst({ where: { id: threadId, applicationId: id } });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "Message body required." }, { status: 400 });

  const [message] = await prisma.$transaction([
    prisma.mailMessage.create({
      data: { threadId, senderRole: "STAFF", senderId: session!.user.id, body },
    }),
    prisma.mailThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
  ]);

  await logAudit({
    applicationId: id,
    objectType: "MailMessage",
    objectId: message.id,
    action: "CREATE",
    actionDetail: "Staff replied to a message thread",
    userId: session!.user.id,
  });

  return NextResponse.json(message, { status: 201 });
}
