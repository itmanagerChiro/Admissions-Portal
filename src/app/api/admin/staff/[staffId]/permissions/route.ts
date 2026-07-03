import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { PermissionKey } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "MANAGE_PERMISSIONS");
  if (guard) return guard;

  const perms = await prisma.staffPermission.findMany({ where: { staffUserId: staffId } });
  return NextResponse.json(perms);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "MANAGE_PERMISSIONS");
  if (guard) return guard;

  const { permissions }: { permissions: { key: PermissionKey; granted: boolean }[] } = await req.json();

  await prisma.$transaction(
    permissions.map(({ key, granted }) =>
      prisma.staffPermission.upsert({
        where: { staffUserId_permissionKey: { staffUserId: staffId, permissionKey: key } },
        update: { granted },
        create: { staffUserId: staffId, permissionKey: key, granted },
      })
    )
  );

  return NextResponse.json({ success: true });
}
