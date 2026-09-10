import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent } from "@/lib/timeline";
import { notifyStudentOfBankTransferApproved } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const application = await prisma.application.findUnique({
    where: { id },
    select: { id: true, depositStatus: true, currentStage: true },
  });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.depositStatus !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "This application has no bank transfer awaiting review." }, { status: 400 });
  }

  const offer = await prisma.offer.findFirst({
    where: { applicationId: id, responseStatus: "PENDING" },
  });
  if (!offer) {
    return NextResponse.json({ error: "No pending offer found for this application." }, { status: 400 });
  }

  const shouldAdvanceStage = application.currentStage !== "ACCEPTED";

  await prisma.$transaction([
    prisma.application.update({
      where: { id },
      data: {
        depositStatus: "PAID",
        depositPaidAt: new Date(),
        ...(shouldAdvanceStage ? { currentStage: "ACCEPTED" } : {}),
      },
    }),
    prisma.offer.update({
      where: { id: offer.id },
      data: { responseStatus: "ACCEPTED", respondedAt: new Date() },
    }),
    ...(shouldAdvanceStage
      ? [
          prisma.applicationStageHistory.create({
            data: {
              applicationId: id,
              fromStage: application.currentStage,
              toStage: "ACCEPTED",
              advancedById: session!.user.id,
              notes: "Automatically advanced: staff approved bank transfer, offer accepted.",
            },
          }),
        ]
      : []),
  ]);

  await createTimelineEvent({
    applicationId: id,
    eventType: "OFFER_ACCEPTED",
    title: "Bank transfer approved — offer accepted",
    createdById: session!.user.id,
  });

  await notifyStudentOfBankTransferApproved(id);

  await logAudit({
    applicationId: id,
    objectType: "Application",
    objectId: id,
    action: "UPDATE",
    actionDetail: "Staff approved bank transfer deposit, offer accepted",
    userId: session!.user.id,
  });

  return NextResponse.json({ success: true });
}
