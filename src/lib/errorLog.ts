import { prisma } from "@/lib/prisma";

export async function logApplicationError(source: string, err: unknown, email?: string) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  console.error(`[${source}]`, err);

  try {
    await prisma.applicationErrorLog.create({
      data: { source, message, stack, email },
    });
  } catch (logErr) {
    console.error("Failed to persist application error log:", logErr);
  }
}
