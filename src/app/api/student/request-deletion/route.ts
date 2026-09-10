import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { createTimelineEvent } from "@/lib/timeline";
import { notifyAdminsOfAccountDeletionRequest } from "@/lib/notifications";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, firstName: true, lastName: true, email: true, deletionRequestedAt: true },
  });
  if (!user) return Response.json({ error: "Not found" }, { status: 404 });
  if (user.deletionRequestedAt) {
    return Response.json({ error: "Deletion has already been requested for this account." }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: user.id },
    select: { id: true },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { deletionRequestedAt: new Date() },
  });

  const studentName = `${user.firstName} ${user.lastName}`;

  if (application) {
    await createTimelineEvent({
      applicationId: application.id,
      eventType: "STAGE_CHANGE",
      title: "Account deletion requested",
      description: "The student has requested that their account be deleted.",
      isVisibleToStudent: false,
      createdById: user.id,
    });

    await logAudit({
      applicationId: application.id,
      objectType: "User",
      objectId: user.id,
      action: "UPDATE",
      actionDetail: "Student requested account deletion",
      userId: user.id,
    });

    await notifyAdminsOfAccountDeletionRequest(application.id, studentName, user.email);
  }

  return Response.json({ success: true });
}
