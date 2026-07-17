import { prisma } from "@/lib/prisma";
import { sendTemplatedEmail, buildAppUrl } from "@/lib/email";
import { STAGE_LABELS } from "@/lib/stages";
import type { ApplicationStageKey } from "@/generated/prisma/client";

async function isEmailNotificationsEnabled(): Promise<boolean> {
  const row = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
  return row?.emailNotificationsEnabled ?? false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTaskListHtml(tasks: { title: string }[]): string {
  return tasks.map((t) => `<li>${escapeHtml(t.title)}</li>`).join("");
}

export async function notifyStudentOfNewTasks(
  applicationId: string,
  tasks: { id: string; title: string }[]
): Promise<void> {
  if (tasks.length === 0) return;
  try {
    if (!(await isEmailNotificationsEnabled())) return;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { student: { select: { email: true, firstName: true } } },
    });
    if (!application) return;

    await sendTemplatedEmail("TASKS_ASSIGNED", application.student.email, {
      firstName: application.student.firstName,
      taskList: renderTaskListHtml(tasks),
      portalUrl: buildAppUrl("/tasks"),
    });
  } catch (err) {
    console.error("notifyStudentOfNewTasks failed", err);
  }
}

export async function notifyStudentOfStageChange(
  applicationId: string,
  newStage: ApplicationStageKey
): Promise<void> {
  try {
    if (!(await isEmailNotificationsEnabled())) return;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { student: { select: { email: true, firstName: true } } },
    });
    if (!application) return;

    await sendTemplatedEmail("STAGE_CHANGE_NOTIFICATION", application.student.email, {
      firstName: application.student.firstName,
      stageName: STAGE_LABELS[newStage],
      portalUrl: buildAppUrl("/dashboard"),
    });
  } catch (err) {
    console.error("notifyStudentOfStageChange failed", err);
  }
}

export async function notifyStudentTaskReminder(
  applicationId: string
): Promise<{ sent: boolean; taskCount: number }> {
  try {
    const tasks = await prisma.task.findMany({
      where: { applicationId, isRequired: true, status: { not: "APPROVED" } },
      select: { id: true, title: true },
    });
    if (tasks.length === 0) return { sent: false, taskCount: 0 };

    if (!(await isEmailNotificationsEnabled())) {
      return { sent: false, taskCount: tasks.length };
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { student: { select: { email: true, firstName: true } } },
    });
    if (!application) return { sent: false, taskCount: tasks.length };

    await sendTemplatedEmail("TASK_REMINDER", application.student.email, {
      firstName: application.student.firstName,
      taskList: renderTaskListHtml(tasks),
      portalUrl: buildAppUrl("/tasks"),
    });

    return { sent: true, taskCount: tasks.length };
  } catch (err) {
    console.error("notifyStudentTaskReminder failed", err);
    return { sent: false, taskCount: 0 };
  }
}

export async function notifyAdminsOfAllTasksComplete(applicationId: string): Promise<void> {
  try {
    if (!(await isEmailNotificationsEnabled())) return;

    const [application, completedTasks] = await Promise.all([
      prisma.application.findUnique({
        where: { id: applicationId },
        select: { student: { select: { firstName: true, lastName: true } } },
      }),
      prisma.task.findMany({
        where: { applicationId, isRequired: true, status: "APPROVED" },
        select: { title: true },
      }),
    ]);
    if (!application) return;

    const recipients = await prisma.user.findMany({
      where: {
        role: "STAFF",
        isActive: true,
        OR: [
          { isGlobalAdmin: true },
          {
            staffPermissions: {
              some: { permissionKey: "REVIEW_TASK_SUBMISSIONS", granted: true },
            },
          },
        ],
      },
      select: { email: true },
    });
    if (recipients.length === 0) return;

    const studentName = `${application.student.firstName} ${application.student.lastName}`;
    const taskList = renderTaskListHtml(completedTasks);
    const applicantUrl = buildAppUrl(`/admin/applicants/${applicationId}`);

    await Promise.allSettled(
      recipients.map((r) =>
        sendTemplatedEmail("TASKS_ALL_COMPLETE_ADMIN", r.email, {
          studentName,
          taskList,
          applicantUrl,
        })
      )
    );
  } catch (err) {
    console.error("notifyAdminsOfAllTasksComplete failed", err);
  }
}
