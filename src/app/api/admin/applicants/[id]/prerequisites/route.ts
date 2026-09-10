import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const { prerequisitesMet, prerequisiteNotes } = await req.json();

  const application = await prisma.application.findUnique({ where: { id }, select: { id: true } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.application.update({
    where: { id },
    data: {
      prerequisitesMet: prerequisitesMet !== undefined ? !!prerequisitesMet : undefined,
      prerequisiteNotes: prerequisiteNotes !== undefined ? prerequisiteNotes : undefined,
    },
  });

  await logAudit({
    applicationId: id,
    objectType: "Application",
    objectId: id,
    action: "UPDATE",
    actionDetail: "Prerequisites updated",
    userId: session!.user.id,
  });

  return NextResponse.json({ success: true });
}
