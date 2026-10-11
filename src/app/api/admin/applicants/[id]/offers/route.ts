import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent } from "@/lib/timeline";
import { notifyStudentOfOffer } from "@/lib/notifications";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "VIEW_APPLICANTS");
  if (guard) return guard;

  const offers = await prisma.offer.findMany({
    where: { applicationId: id },
    include: { conditions: { include: { evidenceDocuments: true } }, issuedBy: { select: { firstName: true, lastName: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const body = await req.json();
  const type: string = body.type;
  const acceptanceDeadline: string | null = body.acceptanceDeadline ?? null;
  const offerLetterReference: string | null = body.offerLetterReference ?? null;
  const notes: string | null = body.notes ?? null;
  const notifyStudent: boolean = body.notifyStudent ?? true;
  const conditions: { conditionText: string; isStandard?: boolean }[] = Array.isArray(body.conditions)
    ? body.conditions
    : [];

  if (type !== "CONDITIONAL" && type !== "UNCONDITIONAL") {
    return NextResponse.json({ error: "Invalid offer type" }, { status: 400 });
  }
  if (type === "CONDITIONAL" && conditions.length === 0) {
    return NextResponse.json({ error: "Conditional offers require at least one condition" }, { status: 400 });
  }

  const application = await prisma.application.findUnique({ where: { id }, select: { id: true, currentStage: true } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const targetStage = type === "CONDITIONAL" ? "OFFER_CONDITIONAL" : "OFFER_UNCONDITIONAL";
  const shouldAdvanceStage = application.currentStage !== targetStage;

  const [offer] = await prisma.$transaction([
    prisma.offer.create({
      data: {
        applicationId: id,
        type,
        issuedById: session!.user.id,
        acceptanceDeadline: acceptanceDeadline ? new Date(acceptanceDeadline) : null,
        offerLetterReference,
        notes,
        conditions: {
          create: conditions.map((c) => ({
            conditionText: c.conditionText,
            isStandard: c.isStandard ?? true,
          })),
        },
      },
      include: { conditions: true },
    }),
    ...(shouldAdvanceStage
      ? [
          prisma.application.update({ where: { id }, data: { currentStage: targetStage } }),
          prisma.applicationStageHistory.create({
            data: {
              applicationId: id,
              fromStage: application.currentStage,
              toStage: targetStage,
              advancedById: session!.user.id,
              notes: "Automatically advanced: offer issued.",
            },
          }),
        ]
      : []),
  ]);

  await createTimelineEvent({
    applicationId: id,
    eventType: "OFFER_ISSUED",
    title: `${type === "CONDITIONAL" ? "Conditional" : "Unconditional"} offer issued`,
    description: notes ?? undefined,
    createdById: session!.user.id,
  });

  if (notifyStudent) await notifyStudentOfOffer(id, offer.type, offer.acceptanceDeadline);

  await logAudit({
    applicationId: id,
    objectType: "Offer",
    objectId: offer.id,
    action: "CREATE",
    actionDetail: `${type === "CONDITIONAL" ? "Conditional" : "Unconditional"} offer issued`,
    userId: session!.user.id,
  });

  return NextResponse.json({ success: true, offer });
}
