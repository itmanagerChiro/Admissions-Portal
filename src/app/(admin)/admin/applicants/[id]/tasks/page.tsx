import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { AssignTaskForm } from "./AssignTaskForm";
import { TaskReviewPanel } from "./TaskReviewPanel";
import Link from "next/link";

export default async function ApplicantTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");
  requirePermission(session, "VIEW_APPLICANTS");

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      student: { select: { firstName: true, lastName: true } },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          assignedBy: { select: { firstName: true, lastName: true } },
          documents: { select: { id: true, filename: true, storageKey: true, status: true } },
        },
      },
    },
  });

  if (!app) notFound();

  const canAssign = hasPermission(session, "ASSIGN_TASKS");
  const canReview = hasPermission(session, "REVIEW_TASK_SUBMISSIONS");

  return (
    <div className="px-8 py-7 max-w-3xl">
      <Link href={`/admin/applicants/${id}`} className="text-xs transition-colors" style={{ color: "#aaa" }}>
        ← {app.student.firstName} {app.student.lastName}
      </Link>
      <h1 className="font-serif text-2xl text-text mt-3 mb-6">
        Tasks — {app.student.firstName} {app.student.lastName}
      </h1>

      {canAssign && (
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#999" }}>Assign New Task</p>
          <AssignTaskForm applicationId={id} staffId={session.user.id} />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {app.tasks.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm" style={{ color: "#aaa" }}>No tasks assigned yet.</div>
        ) : (
          app.tasks.map((task, i) => {
            const statusColor =
              task.status === "APPROVED" ? "#22c55e" :
              task.status === "REJECTED" ? "#c0392b" :
              task.status === "SUBMITTED" ? "#C79A3B" :
              task.status === "IN_PROGRESS" ? "#3b82f6" : "rgba(0,0,0,0.15)";

            return (
              <div
                key={task.id}
                className="p-5"
                style={{
                  borderLeft: `3px solid ${statusColor}`,
                  borderBottom: i < app.tasks.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold" style={{ color: "#222" }}>{task.title}</p>
                  <Badge variant={
                    task.status === "APPROVED" ? "green" :
                    task.status === "REJECTED" ? "red" :
                    task.status === "SUBMITTED" ? "gold" :
                    task.status === "IN_PROGRESS" ? "blue" : "muted"
                  }>
                    {task.status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                  </Badge>
                </div>
                {task.description && <p className="text-xs mb-1" style={{ color: "#aaa" }}>{task.description}</p>}
                <p className="text-xs mb-3" style={{ color: "#bbb" }}>
                  Assigned by {task.assignedBy.firstName} {task.assignedBy.lastName}
                  {task.dueDate && ` · Due ${new Date(task.dueDate).toLocaleDateString("en-NZ")}`}
                </p>

                {task.status === "SUBMITTED" && canReview && (
                  <TaskReviewPanel
                    taskId={task.id}
                    applicationId={id}
                    studentNote={task.studentNote}
                    documents={task.documents}
                  />
                )}

                {(task.status === "APPROVED" || task.status === "REJECTED") && task.reviewNote && (
                  <div
                    className="px-3 py-2 text-xs rounded-lg"
                    style={{
                      borderLeft: `3px solid ${task.status === "APPROVED" ? "#22c55e" : "#c0392b"}`,
                      backgroundColor: task.status === "APPROVED" ? "rgba(34,197,94,0.06)" : "rgba(192,57,43,0.06)",
                      color: "#555",
                    }}
                  >
                    <strong className="block mb-0.5" style={{ color: task.status === "APPROVED" ? "#22c55e" : "#c0392b" }}>
                      {task.status === "APPROVED" ? "Approved" : "Rejected"}
                    </strong>
                    {task.reviewNote}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}