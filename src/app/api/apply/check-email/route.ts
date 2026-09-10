import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email")?.trim();
  if (!email) return Response.json({ exists: false });

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return Response.json({ exists: !!existing });
}
