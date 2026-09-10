import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "EDIT_INTERNATIONAL");
  if (guard) return guard;

  const data = await req.json();

  const record = await prisma.internationalCompliance.upsert({
    where: { applicationId: id },
    update: data,
    create: { applicationId: id, ...data },
  });

  await logAudit({
    applicationId: id,
    objectType: "InternationalCompliance",
    objectId: record.id,
    action: "UPDATE",
    actionDetail: `International compliance updated: ${Object.keys(data).join(", ")}`,
    userId: session!.user.id,
  });

  return NextResponse.json(record);
}
