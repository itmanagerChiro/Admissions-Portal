import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "EDIT_APPLICANT_PROFILE");
  if (guard) return guard;

  const body = await req.json();

  const {
    firstName, lastName, phone, city, address, postcode, country,
    guardianName, guardianEmail, guardianPhone,
  } = body;

  const app = await prisma.application.findUnique({
    where: { id },
    select: { id: true, studentId: true },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: app.studentId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
      },
    }),
    prisma.application.update({
      where: { id },
      data: {
        ...(phone !== undefined && { phone }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(postcode !== undefined && { postcode }),
        ...(country !== undefined && { country }),
        ...(guardianName !== undefined && { guardianName }),
        ...(guardianEmail !== undefined && { guardianEmail }),
        ...(guardianPhone !== undefined && { guardianPhone }),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
