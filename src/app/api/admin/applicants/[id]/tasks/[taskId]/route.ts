import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent } from "@/lib/timeline";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "REVIEW_TASK_SUBMISSIONS");
  if (guard) return guard;

  const { action, reviewNote } = await req.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId, applicationId: id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      reviewNote,
      reviewedAt: new Date(),
    },
  });

  await createTimelineEvent({
    applicationId: id,
    eventType: action === "approve" ? "TASK_COMPLETED" : "NOTE_ADDED",
    title: `Task ${action === "approve" ? "Approved" : "Rejected"}: ${task.title}`,
    description: reviewNote || undefined,
    isVisibleToStudent: true,
    relatedTaskId: taskId,
    createdById: session!.user.id,
  });

  return NextResponse.json({ success: true });
}
