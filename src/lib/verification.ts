import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { VerificationTokenPurpose } from "@/generated/prisma/client";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function ttlFor(purpose: VerificationTokenPurpose) {
  return purpose === "EMAIL_VERIFICATION" ? EMAIL_VERIFICATION_TTL_MS : PASSWORD_RESET_TTL_MS;
}

export async function issueVerificationToken(userId: string, purpose: VerificationTokenPurpose) {
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      userId,
      purpose,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + ttlFor(purpose)),
    },
  });
  return token;
}

export async function consumeVerificationToken(token: string, purpose: VerificationTokenPurpose) {
  const record = await prisma.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.purpose !== purpose) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.userId;
}
