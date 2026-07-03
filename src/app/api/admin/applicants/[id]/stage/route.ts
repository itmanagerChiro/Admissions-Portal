import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent, STAGE_ORDER } from "@/lib/timeline";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const body = await req.json();
  const nextStage = body.toStage ?? body.stage;
  const notes: string = body.notes ?? "";

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
  ]);

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
