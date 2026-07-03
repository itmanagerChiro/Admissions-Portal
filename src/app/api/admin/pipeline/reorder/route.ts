import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

// Body: { orderedIds: string[] } — full ordered list of application IDs for a column
export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.application.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ success: true });
}
