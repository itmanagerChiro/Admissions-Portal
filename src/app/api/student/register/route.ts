import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { issueVerificationToken } from "@/lib/verification";
import { sendTemplatedEmail, buildAppUrl } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password } = await req.json();

  if (!firstName || !lastName || !email || !password) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Find the active intake year
  const intakeYear = await prisma.intakeYear.findFirst({ where: { isActive: true } });
  if (!intakeYear) {
    return Response.json({ error: "No active intake year configured." }, { status: 500 });
  }

  // Generate applicant number
  const count = await prisma.application.count();
  const applicantNumber = String(count + 1).padStart(4, "0");

  const userId = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        role: "STUDENT",
      },
    });

    const application = await tx.application.create({
      data: {
        studentId: user.id,
        intakeYearId: intakeYear.id,
        applicantNumber,
        category: "DOMESTIC",
        yearLevel: "YEAR_1",
        currentStage: "NEW_SUBMITTED",
        status: "IN_PROGRESS",
        submittedAt: new Date(),
      },
    });

    await tx.timelineEvent.create({
      data: {
        applicationId: application.id,
        eventType: "STAGE_CHANGE",
        title: "Application submitted",
        description: `Your online application was received. An acknowledgement was sent to ${email}.`,
        isVisibleToStudent: true,
        relatedStageKey: "NEW_SUBMITTED",
      },
    });

    return user.id;
  });

  const token = await issueVerificationToken(userId, "EMAIL_VERIFICATION");
  const verifyUrl = buildAppUrl(`/verify-email?token=${token}`);

  try {
    await sendTemplatedEmail("ACCOUNT_VERIFICATION", email, { firstName, verifyUrl });
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return Response.json({ success: true }, { status: 201 });
}
