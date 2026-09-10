import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.isGlobalAdmin) return new NextResponse(null, { status: 403 });

  const intakeYear = await prisma.intakeYear.findUnique({ where: { id } });
  if (!intakeYear) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { label, isVisible, isOpenForApplications, isArchived } = await req.json();

  if (intakeYear.isArchived && isArchived !== false) {
    return NextResponse.json({ error: "This intake year is archived and read-only. Unarchive it first to make changes." }, { status: 400 });
  }

  const updated = await prisma.intakeYear.update({
    where: { id },
    data: {
      ...(label !== undefined && { label }),
      ...(isVisible !== undefined && { isVisible: !!isVisible }),
      ...(isOpenForApplications !== undefined && { isOpenForApplications: !!isOpenForApplications }),
      ...(isArchived !== undefined && {
        isArchived: !!isArchived,
        archivedAt: isArchived ? new Date() : null,
        // Archiving always removes an intake from the dropdown and student portal.
        ...(isArchived ? { isVisible: false, isOpenForApplications: false } : {}),
      }),
    },
  });

  const changedFields = ["label", "isVisible", "isOpenForApplications", "isArchived"].filter(
    (k) => ({ label, isVisible, isOpenForApplications, isArchived } as Record<string, unknown>)[k] !== undefined
  );
  const changeDescription = isArchived !== undefined
    ? (isArchived ? "Archived" : "Unarchived")
    : `Updated (${changedFields.join(", ")})`;

  await logAudit({
    objectType: "IntakeYear",
    objectId: id,
    action: "UPDATE",
    actionDetail: `${changeDescription} intake year: ${intakeYear.label}`,
    userId: session.user.id,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.isGlobalAdmin) return new NextResponse(null, { status: 403 });

  const intakeYear = await prisma.intakeYear.findUnique({ where: { id } });
  if (!intakeYear) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const applicationCount = await prisma.application.count({ where: { intakeYearId: id } });
  if (applicationCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${applicationCount} application${applicationCount === 1 ? "" : "s"} still reference this intake year. Archive it instead to preserve data.` },
      { status: 400 }
    );
  }

  await prisma.intakeYear.delete({ where: { id } });

  await logAudit({
    objectType: "IntakeYear",
    objectId: id,
    action: "DELETE",
    actionDetail: `Deleted intake year: ${intakeYear.label}`,
    userId: session.user.id,
  });

  return NextResponse.json({ success: true });
}
