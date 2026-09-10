import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const { score, notes, interviewDate, format } = await req.json();

  if (score !== undefined && score !== null && (score < 1 || score > 10)) {
    return NextResponse.json({ error: "Score must be between 1 and 10." }, { status: 400 });
  }

  const application = await prisma.application.findUnique({ where: { id }, select: { id: true } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const review = await prisma.interviewReview.upsert({
    where: { applicationId: id },
    update: {
      score, notes,
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      format,
      reviewedById: session!.user.id,
    },
    create: {
      applicationId: id,
      score, notes,
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      format,
      reviewedById: session!.user.id,
    },
  });

  await logAudit({
    applicationId: id,
    objectType: "InterviewReview",
    objectId: review.id,
    action: "UPDATE",
    actionDetail: `Interview review updated${score != null ? ` — score ${score}/10` : ""}`,
    userId: session!.user.id,
  });

  return NextResponse.json({ review });
}
