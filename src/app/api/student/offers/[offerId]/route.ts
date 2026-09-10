import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTimelineEvent } from "@/lib/timeline";
import { notifyAdminsOfOfferResponse } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  const offer = await prisma.offer.findFirst({
    where: { id: offerId, applicationId: application.id },
  });
  if (!offer) return Response.json({ error: "Not found" }, { status: 404 });
  if (offer.responseStatus !== "PENDING") {
    return Response.json({ error: "This offer has already been responded to." }, { status: 400 });
  }

  const { response } = await req.json();
  if (response !== "DECLINED") {
    return Response.json({ error: "Invalid response. To accept an offer, pay your enrolment deposit instead." }, { status: 400 });
  }

  await prisma.offer.update({
    where: { id: offerId },
    data: { responseStatus: "DECLINED", respondedAt: new Date() },
  });

  await createTimelineEvent({
    applicationId: application.id,
    eventType: "OFFER_DECLINED",
    title: "Offer declined",
    createdById: session.user.id,
  });

  await notifyAdminsOfOfferResponse(application.id, offer.type, false);

  await logAudit({
    applicationId: application.id,
    objectType: "Offer",
    objectId: offerId,
    action: "UPDATE",
    actionDetail: "Student declined their offer",
    userId: session.user.id,
  });

  return Response.json({ success: true });
}
