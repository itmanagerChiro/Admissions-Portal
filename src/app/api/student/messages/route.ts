import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  const { body } = await req.json();
  if (!body?.trim()) return Response.json({ error: "Message body required." }, { status: 400 });

  const thread = await prisma.messageThread.upsert({
    where: { applicationId: application.id },
    create: { applicationId: application.id },
    update: { updatedAt: new Date() },
  });

  const message = await prisma.message.create({
    data: {
      threadId: thread.id,
      senderRole: "STUDENT",
      senderId: session.user.id,
      body,
    },
  });

  await logAudit({
    applicationId: application.id,
    objectType: "Message",
    objectId: message.id,
    action: "CREATE",
    actionDetail: "Student sent a message",
    userId: session.user.id,
  });

  return Response.json(message, { status: 201 });
}
