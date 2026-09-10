import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "VIEW_ALL_MESSAGES");
  if (guard) return guard;

  const search = req.nextUrl.searchParams.get("search")?.trim();

  const threads = await prisma.mailThread.findMany({
    where: {
      applicationId: id,
      ...(search ? { subject: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { sentAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { isRead: false, senderRole: "STUDENT" } } } },
    },
  });

  return NextResponse.json(threads);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "SEND_MESSAGES");
  if (guard) return guard;

  const { subject, body } = await req.json();
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!body?.trim()) return NextResponse.json({ error: "Message body is required." }, { status: 400 });

  const thread = await prisma.mailThread.create({
    data: {
      applicationId: id,
      subject: subject.trim(),
      messages: {
        create: { senderRole: "STAFF", senderId: session!.user.id, body },
      },
    },
    include: { messages: true },
  });

  await logAudit({
    applicationId: id,
    objectType: "MailThread",
    objectId: thread.id,
    action: "CREATE",
    actionDetail: `Staff started a new message thread: "${thread.subject}"`,
    userId: session!.user.id,
  });

  return NextResponse.json(thread, { status: 201 });
}
