import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  const search = new URL(req.url).searchParams.get("search")?.trim();

  const threads = await prisma.mailThread.findMany({
    where: {
      applicationId: application.id,
      ...(search ? { subject: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { sentAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { isRead: false, senderRole: "STAFF" } } } },
    },
  });

  return Response.json(threads);
}

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

  const { subject, body } = await req.json();
  if (!subject?.trim()) return Response.json({ error: "Subject is required." }, { status: 400 });
  if (!body?.trim()) return Response.json({ error: "Message body is required." }, { status: 400 });

  const thread = await prisma.mailThread.create({
    data: {
      applicationId: application.id,
      subject: subject.trim(),
      messages: {
        create: { senderRole: "STUDENT", senderId: session.user.id, body },
      },
    },
    include: { messages: true },
  });

  await logAudit({
    applicationId: application.id,
    objectType: "MailThread",
    objectId: thread.id,
    action: "CREATE",
    actionDetail: `Student started a new message thread: "${thread.subject}"`,
    userId: session.user.id,
  });

  return Response.json(thread, { status: 201 });
}
