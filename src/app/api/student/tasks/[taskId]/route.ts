import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTimelineEvent } from "@/lib/timeline";

export async function PATCH(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.task.findFirst({
    where: { id: taskId, applicationId: application.id },
  });
  if (!task) return Response.json({ error: "Not found" }, { status: 404 });

  if (!["PENDING", "IN_PROGRESS", "REJECTED"].includes(task.status)) {
    return Response.json({ error: "Task cannot be submitted in its current state." }, { status: 400 });
  }

  const { studentNote } = await req.json();

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "SUBMITTED", completedAt: new Date(), studentNote },
  });

  await createTimelineEvent({
    applicationId: application.id,
    eventType: "TASK_COMPLETED",
    title: `Task submitted: ${task.title}`,
    description: "Your submission is under review by the admissions team.",
    relatedTaskId: taskId,
    createdById: session.user.id,
  });

  return Response.json({ success: true });
}
