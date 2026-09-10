import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  const thread = await prisma.mailThread.findFirst({
    where: { id: threadId, applicationId: application.id },
    include: {
      messages: { orderBy: { sentAt: "asc" }, include: { sender: { select: { firstName: true, lastName: true } } } },
    },
  });
  if (!thread) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.mailMessage.updateMany({
    where: { threadId, senderRole: "STAFF", isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return Response.json(thread);
}

export async function POST(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  const thread = await prisma.mailThread.findFirst({ where: { id: threadId, applicationId: application.id } });
  if (!thread) return Response.json({ error: "Not found" }, { status: 404 });

  const { body } = await req.json();
  if (!body?.trim()) return Response.json({ error: "Message body required." }, { status: 400 });

  const [message] = await prisma.$transaction([
    prisma.mailMessage.create({
      data: { threadId, senderRole: "STUDENT", senderId: session.user.id, body },
    }),
    prisma.mailThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } }),
  ]);

  await logAudit({
    applicationId: application.id,
    objectType: "MailMessage",
    objectId: message.id,
    action: "CREATE",
    actionDetail: "Student replied to a message thread",
    userId: session.user.id,
  });

  return Response.json(message, { status: 201 });
}
