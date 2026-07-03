import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "SEND_MESSAGES");
  if (guard) return guard;

  const { body } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "Message body required" }, { status: 400 });
  }

  const thread = await prisma.messageThread.upsert({
    where: { applicationId: id },
    create: { applicationId: id },
    update: { updatedAt: new Date() },
  });

  const message = await prisma.message.create({
    data: {
      threadId: thread.id,
      senderId: session!.user.id,
      senderRole: "STAFF",
      body,
    },
  });

  return NextResponse.json(message, { status: 201 });
}
