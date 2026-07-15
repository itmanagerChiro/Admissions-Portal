import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueVerificationToken } from "@/lib/verification";
import { sendTemplatedEmail, buildAppUrl } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: "Email required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond with success to avoid leaking whether an account exists.
  if (!user || user.emailVerified) {
    return Response.json({ success: true });
  }

  const token = await issueVerificationToken(user.id, "EMAIL_VERIFICATION");
  const verifyUrl = buildAppUrl(`/verify-email?token=${token}`);

  try {
    await sendTemplatedEmail("ACCOUNT_VERIFICATION", user.email, {
      firstName: user.firstName,
      verifyUrl,
    });
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return Response.json({ success: true });
}
