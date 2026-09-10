import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent } from "@/lib/timeline";
import { notifyStudentOfApplicationDeclined } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import type { CommitteeDecisionType } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const body = await req.json();
  const decisionInput: string = body.decision;
  const notes: string | null = body.notes ?? null;
  const deferReason: string | null = body.deferReason ?? null;
  const deferUntil: string | null = body.deferUntil ?? null;

  if (!["APPROVE", "DECLINE", "DEFER"].includes(decisionInput)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }
  const decision = decisionInput as CommitteeDecisionType;
  if (decision === "DEFER" && !deferReason?.trim()) {
    return NextResponse.json({ error: "A defer reason is required." }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { id },
    select: { id: true, currentStage: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.currentStage !== "COMMITTEE") {
    return NextResponse.json({ error: "This application is not currently at the Committee stage." }, { status: 400 });
  }

  const record = await prisma.committeeDecision.upsert({
    where: { applicationId: id },
    update: {
      decision, notes, deferReason,
      deferUntil: deferUntil ? new Date(deferUntil) : null,
      decidedById: session!.user.id,
      decidedAt: new Date(),
    },
    create: {
      applicationId: id,
      decision, notes, deferReason,
      deferUntil: deferUntil ? new Date(deferUntil) : null,
      decidedById: session!.user.id,
    },
  });

  if (decision === "DECLINE") {
    await prisma.application.update({ where: { id }, data: { status: "DECLINED" } });
  }

  await createTimelineEvent({
    applicationId: id,
    eventType: "STAGE_CHANGE",
    title: `Committee decision: ${decision}`,
    description: decision === "DEFER" ? deferReason ?? undefined : notes ?? undefined,
    isVisibleToStudent: decision === "DECLINE",
    createdById: session!.user.id,
  });

  if (decision === "DECLINE") {
    await notifyStudentOfApplicationDeclined(id, notes);
  }

  await logAudit({
    applicationId: id,
    objectType: "CommitteeDecision",
    objectId: record.id,
    action: "CREATE",
    actionDetail: `Committee recorded decision: ${decision}`,
    userId: session!.user.id,
  });

  return NextResponse.json({ success: true, decision: record });
}
