import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { createTimelineEvent } from "@/lib/timeline";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "ASSIGN_TASKS");
  if (guard) return guard;

  const { title, description, dueDate, isRequired, requiresDocument, documentInstructions } = await req.json();

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      applicationId: id,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      isRequired: !!isRequired,
      requiresDocument: !!requiresDocument,
      documentInstructions,
      assignedById: session!.user.id,
    },
  });

  await createTimelineEvent({
    applicationId: id,
    eventType: "TASK_ASSIGNED",
    title: `Task Assigned: ${title}`,
    description: "A new task has been assigned to you.",
    isVisibleToStudent: true,
    relatedTaskId: task.id,
    createdById: session!.user.id,
  });

  return NextResponse.json(task, { status: 201 });
}
