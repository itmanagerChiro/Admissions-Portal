import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.isGlobalAdmin) return new NextResponse(null, { status: 403 });

  const intakeYear = await prisma.intakeYear.findUnique({ where: { id } });
  if (!intakeYear) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (intakeYear.isArchived) {
    return NextResponse.json({ error: "Cannot set an archived intake year as active. Unarchive it first." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.intakeYear.updateMany({ data: { isActive: false } }),
    prisma.intakeYear.update({ where: { id }, data: { isActive: true } }),
  ]);

  return NextResponse.json({ success: true });
}
