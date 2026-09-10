import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent } from "@/lib/timeline";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string; conditionId: string }> }
) {
  const { id, offerId, conditionId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const body = await req.json();
  const status: string = body.status;
  if (status !== "SATISFIED" && status !== "WAIVED" && status !== "PENDING") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const condition = await prisma.offerCondition.findFirst({
    where: { id: conditionId, offerId, offer: { applicationId: id } },
  });
  if (!condition) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.offerCondition.update({
    where: { id: conditionId },
    data: {
      status,
      satisfiedAt: status === "PENDING" ? null : new Date(),
      satisfiedById: status === "PENDING" ? null : session!.user.id,
    },
  });

  if (status !== "PENDING") {
    await createTimelineEvent({
      applicationId: id,
      eventType: "OFFER_CONDITION_SATISFIED",
      title: `Condition ${status === "WAIVED" ? "waived" : "satisfied"}: ${condition.conditionText}`,
      createdById: session!.user.id,
    });
  }

  await logAudit({
    applicationId: id,
    objectType: "OfferCondition",
    objectId: conditionId,
    action: "UPDATE",
    actionDetail: `Condition "${condition.conditionText}" set to ${status}`,
    userId: session!.user.id,
  });

  return NextResponse.json({ success: true, condition: updated });
}
