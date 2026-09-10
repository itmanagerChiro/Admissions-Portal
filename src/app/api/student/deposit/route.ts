import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTimelineEvent } from "@/lib/timeline";
import { notifyStudentOfStageChange, notifyAdminsOfBankTransferSubmitted } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Credit Card",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { method } = await req.json();
  if (!["BANK_TRANSFER", "CREDIT_CARD"].includes(method)) {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true, depositStatus: true, currentStage: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });
  if (application.depositStatus === "PAID") {
    return Response.json({ error: "Deposit already recorded as paid." }, { status: 400 });
  }
  if (application.depositStatus === "PENDING_REVIEW") {
    return Response.json({ error: "Your bank transfer is already awaiting staff review." }, { status: 400 });
  }

  const offer = await prisma.offer.findFirst({
    where: { applicationId: application.id, responseStatus: "PENDING" },
    include: { conditions: true },
  });
  if (!offer) {
    return Response.json({ error: "No offer is awaiting your response." }, { status: 400 });
  }
  if (offer.type === "CONDITIONAL" && offer.conditions.some((c) => c.status === "PENDING")) {
    return Response.json({ error: "All offer conditions must be satisfied or waived first." }, { status: 400 });
  }

  if (method === "BANK_TRANSFER") {
    await prisma.application.update({
      where: { id: application.id },
      data: { depositStatus: "PENDING_REVIEW", depositMethod: "BANK_TRANSFER" },
    });

    await createTimelineEvent({
      applicationId: application.id,
      eventType: "STAGE_CHANGE",
      title: "Bank transfer submitted",
      description: "Awaiting staff confirmation of your bank transfer before your offer is accepted.",
      createdById: session.user.id,
    });

    await notifyAdminsOfBankTransferSubmitted(application.id);

    await logAudit({
      applicationId: application.id,
      objectType: "Application",
      objectId: application.id,
      action: "UPDATE",
      actionDetail: "Student submitted bank transfer, awaiting staff review",
      userId: session.user.id,
    });

    return Response.json({ success: true, status: "PENDING_REVIEW" });
  }

  // CREDIT_CARD: demo instant "success" — pay deposit, accept offer, and advance stage in one go.
  const shouldAdvanceStage = application.currentStage !== "ACCEPTED";

  await prisma.$transaction([
    prisma.application.update({
      where: { id: application.id },
      data: {
        depositStatus: "PAID",
        depositMethod: "CREDIT_CARD",
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
              applicationId: application.id,
              fromStage: application.currentStage,
              toStage: "ACCEPTED",
              advancedById: session.user.id,
              notes: "Automatically advanced: deposit paid by credit card, offer accepted.",
            },
          }),
        ]
      : []),
  ]);

  await createTimelineEvent({
    applicationId: application.id,
    eventType: "OFFER_ACCEPTED",
    title: "Offer accepted — deposit paid by credit card",
    description: `Demo payment via ${METHOD_LABELS[method]}. No real transaction was processed.`,
    createdById: session.user.id,
  });

  await notifyStudentOfStageChange(application.id, "ACCEPTED");

  await logAudit({
    applicationId: application.id,
    objectType: "Application",
    objectId: application.id,
    action: "UPDATE",
    actionDetail: `Enrolment deposit paid via ${METHOD_LABELS[method]}, offer accepted`,
    userId: session.user.id,
  });

  return Response.json({ success: true, status: "PAID" });
}
