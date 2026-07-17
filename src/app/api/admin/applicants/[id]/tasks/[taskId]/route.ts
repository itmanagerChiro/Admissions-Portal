import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent } from "@/lib/timeline";
import { notifyAdminsOfAllTasksComplete } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const session = await auth();
  const body = await req.json();
  const { action } = body;

  const task = await prisma.task.findUnique({ where: { id: taskId, applicationId: id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve" || action === "reject") {
    const guard = permissionGuard(session, "REVIEW_TASK_SUBMISSIONS");
    if (guard) return guard;

    const reviewNote = body.reviewNote;
    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        reviewNote,
        reviewedAt: new Date(),
        reviewedById: session!.user.id,
        acknowledgedAt: task.acknowledgedAt ?? new Date(),
        acknowledgedById: task.acknowledgedById ?? session!.user.id,
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

    if (newStatus === "APPROVED") {
      const remaining = await prisma.task.count({
        where: { applicationId: id, isRequired: true, status: { not: "APPROVED" } },
      });
      if (remaining === 0) await notifyAdminsOfAllTasksComplete(id);
    }

    return NextResponse.json({ success: true });
  }

  if (action === "acknowledge") {
    const guard = permissionGuard(session, "REVIEW_TASK_SUBMISSIONS");
    if (guard) return guard;

    await prisma.task.update({
      where: { id: taskId },
      data: { acknowledgedAt: new Date(), acknowledgedById: session!.user.id },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "toggle-complete") {
    const guard = permissionGuard(session, "ASSIGN_TASKS");
    if (guard) return guard;

    const isNowComplete = task.status !== "APPROVED";

    await prisma.task.update({
      where: { id: taskId },
      data: isNowComplete
        ? { status: "APPROVED", completedAt: new Date(), reviewedAt: new Date(), reviewedById: session!.user.id }
        : { status: "PENDING", completedAt: null, reviewedAt: null, reviewedById: null },
    });

    if (isNowComplete) {
      await createTimelineEvent({
        applicationId: id,
        eventType: "TASK_COMPLETED",
        title: `Task completed: ${task.title}`,
        isVisibleToStudent: task.audience === "STUDENT",
        relatedTaskId: taskId,
        createdById: session!.user.id,
      });

      const remaining = await prisma.task.count({
        where: { applicationId: id, isRequired: true, status: { not: "APPROVED" } },
      });
      if (remaining === 0) await notifyAdminsOfAllTasksComplete(id);
    }

    return NextResponse.json({ success: true });
  }

  if (action === "assign") {
    const guard = permissionGuard(session, "ASSIGN_TASKS");
    if (guard) return guard;

    const assignedToId: string | null = body.assignedToId ?? null;

    await prisma.task.update({ where: { id: taskId }, data: { assignedToId } });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "DELETE_TASKS");
  if (guard) return guard;

  const task = await prisma.task.findUnique({ where: { id: taskId, applicationId: id } });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.task.delete({ where: { id: taskId } });
  } catch {
    return NextResponse.json(
      { error: "This task has documents attached and can't be deleted." },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
