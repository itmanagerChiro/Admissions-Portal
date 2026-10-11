import "dotenv/config";
import { findApplicationIdsWithTasksDueInDays, notifyStudentTaskReminder } from "@/lib/notifications";

const REMINDER_DAYS_BEFORE_DUE = 2;

/**
 * Sends an automatic task reminder to any applicant with a required, student-facing
 * task due in REMINDER_DAYS_BEFORE_DUE days. Intended to run once daily via an
 * external scheduler (Windows Task Scheduler, cron, PM2 cron_restart, etc.) —
 * this repo does not run its own scheduler process.
 *
 * Usage: npx tsx scripts/send-task-reminders.ts
 */
async function main() {
  const applicationIds = await findApplicationIdsWithTasksDueInDays(REMINDER_DAYS_BEFORE_DUE);
  console.log(`Found ${applicationIds.length} application(s) with tasks due in ${REMINDER_DAYS_BEFORE_DUE} days.`);

  let sent = 0;
  for (const applicationId of applicationIds) {
    const result = await notifyStudentTaskReminder(applicationId);
    if (result.sent) sent++;
  }

  console.log(`Sent ${sent} reminder email(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("send-task-reminders failed", err);
  process.exit(1);
});
