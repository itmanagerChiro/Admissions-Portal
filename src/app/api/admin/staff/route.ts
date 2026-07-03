import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = permissionGuard(session, "MANAGE_STAFF_USERS");
  if (guard) return guard;

  const { firstName, lastName, email, password, isGlobalAdmin } = await req.json();

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role: "STAFF",
      isGlobalAdmin: !!isGlobalAdmin,
    },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
