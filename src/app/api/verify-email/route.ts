import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/verification";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return Response.json({ error: "Token required." }, { status: 400 });

  const userId = await consumeVerificationToken(token, "EMAIL_VERIFICATION");
  if (!userId) {
    return Response.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });

  return Response.json({ success: true });
}
