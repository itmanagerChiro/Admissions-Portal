import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ADVANCE_APPLICATION_STAGE");
  if (guard) return guard;

  const { toStage } = await req.json();
  if (!toStage) return NextResponse.json({ error: "toStage required" }, { status: 400 });

  const openStatuses = ["PENDING", "IN_PROGRESS", "SUBMITTED"] as const;

  const [staleTasks, existingStageTasks] = await Promise.all([
    // Open tasks tied to a different stage than the one we're moving to.
    prisma.task.findMany({
      where: {
        applicationId: id,
        status: { in: [...openStatuses] },
        stageKey: { not: toStage },
      },
      select: { id: true, title: true, status: true, stageKey: true, audience: true },
      orderBy: { createdAt: "asc" },
    }),
    // Tasks already generated for the target stage (from a prior visit to this stage).
    prisma.task.findMany({
      where: { applicationId: id, stageKey: toStage },
      select: { id: true, title: true, status: true, audience: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({ staleTasks, existingStageTasks });
}
