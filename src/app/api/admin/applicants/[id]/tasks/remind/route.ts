import { auth } from "@/lib/auth";
import { permissionGuard } from "@/lib/permissions";
import { notifyStudentTaskReminder } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const guard = permissionGuard(session, "REMIND_TASK");
  if (guard) return guard;

  const result = await notifyStudentTaskReminder(id);

  if (result.taskCount === 0) {
    return NextResponse.json({ error: "No incomplete required tasks" }, { status: 409 });
  }

  if (!result.sent) {
    return NextResponse.json({ sent: false, taskCount: result.taskCount });
  }

  return NextResponse.json({ success: true, sent: true, taskCount: result.taskCount });
}
