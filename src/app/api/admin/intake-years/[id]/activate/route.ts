import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.isGlobalAdmin) return new NextResponse(null, { status: 403 });

  await prisma.$transaction([
    prisma.intakeYear.updateMany({ data: { isActive: false } }),
    prisma.intakeYear.update({ where: { id }, data: { isActive: true } }),
  ]);

  return NextResponse.json({ success: true });
}
