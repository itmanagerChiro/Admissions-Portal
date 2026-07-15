import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent, STAGE_ORDER } from "@/lib/timeline";
import { generateTasksForStage } from "@/lib/taskTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const body = await req.json();
  const nextStage = body.toStage ?? body.stage;
  const notes: string = body.notes ?? "";
  // IDs of open tasks (from other stages) the staff member chose to mark complete now.
  const completeTaskIds: string[] = Array.isArray(body.completeTaskIds) ? body.completeTaskIds : [];
  // IDs of already-existing tasks for the target stage the staff member chose to reset (re-do), rather than keep.
  const resetTaskIds: string[] = Array.isArray(body.resetTaskIds) ? body.resetTaskIds : [];

  const app = await prisma.application.findUnique({ where: { id }, select: { currentStage: true } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!STAGE_ORDER.includes(nextStage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { currentStage: nextStage } }),
    prisma.applicationStageHistory.create({
      data: {
        applicationId: id,
        fromStage: app.currentStage,
        toStage: nextStage,
        advancedById: session!.user.id,
        notes,
      },
    }),
    ...(completeTaskIds.length > 0
      ? [
          prisma.task.updateMany({
            where: { id: { in: completeTaskIds }, applicationId: id },
            data: { status: "APPROVED", completedAt: new Date() },
          }),
        ]
      : []),
    ...(resetTaskIds.length > 0
      ? [
          prisma.task.updateMany({
            where: { id: { in: resetTaskIds }, applicationId: id },
            data: { status: "PENDING", completedAt: null, reviewedAt: null, reviewNote: null },
          }),
        ]
      : []),
  ]);

  await generateTasksForStage(id, nextStage, session!.user.id);

  await createTimelineEvent({
    applicationId: id,
    eventType: "STAGE_CHANGE",
    title: `Stage Advanced`,
    description: [
      `Moved from ${app.currentStage.replace(/_/g, " ")} to ${nextStage.replace(/_/g, " ")}`,
      notes ? `Note: ${notes}` : "",
    ].filter(Boolean).join(" · "),
    isVisibleToStudent: true,
    createdById: session!.user.id,
  });

  return NextResponse.json({ success: true, stage: nextStage });
}
