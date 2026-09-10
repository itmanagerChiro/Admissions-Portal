import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });

  if (!application) return <div className="p-8 text-text-muted">Application not found.</div>;

  const tasks = await prisma.task.findMany({
    where: { applicationId: application.id, audience: "STUDENT" },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="px-8 py-8 max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">My Application</p>
      <h1 className="font-serif text-3xl text-text mb-6">My Tasks</h1>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-16 text-center text-sm" style={{ color: "#aaa" }}>
          You're up to date. No tasks require your attention right now.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {tasks.map((task, i) => {
            const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "APPROVED";
            const accentColor = task.status === "APPROVED" ? "#22c55e" : overdue || task.status === "REJECTED" ? "#c0392b" : "#C79A3B";

            const statusBadge = () => {
              if (task.status === "APPROVED") return <Badge variant="green">Complete</Badge>;
              if (task.status === "REJECTED") return <Badge variant="red">Action Required</Badge>;
              if (task.status === "SUBMITTED") return <Badge variant="gold">Submitted</Badge>;
              if (overdue) return <Badge variant="red">Overdue</Badge>;
              if (task.dueDate) return <Badge variant="gold">Due {new Date(task.dueDate).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</Badge>;
              return task.isRequired ? <Badge variant="red">Required</Badge> : <Badge variant="muted">Optional</Badge>;
            };

            return (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center justify-between px-5 py-4 transition-colors task-row"
                style={{
                  borderLeft: `3px solid ${accentColor}`,
                  borderBottom: i < tasks.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#222" }}>{task.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "#aaa" }}>{task.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {statusBadge()}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#ccc" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
