import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isGlobalAdmin) return new NextResponse(null, { status: 403 });

  const { year, label } = await req.json();

  const intakeYear = await prisma.intakeYear.create({
    data: { year, label },
  });

  return NextResponse.json(intakeYear, { status: 201 });
}
