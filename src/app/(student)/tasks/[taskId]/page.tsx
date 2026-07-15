import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { TaskSubmitForm } from "./TaskSubmitForm";

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });

  if (!application) redirect("/dashboard");

  const task = await prisma.task.findFirst({
    where: { id: taskId, applicationId: application.id, audience: "STUDENT" },
    include: {
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!task) notFound();

  const canSubmit = ["PENDING", "IN_PROGRESS", "REJECTED"].includes(task.status);

  return (
    <div className="px-8 py-8 max-w-2xl">
      <a href="/tasks" className="text-xs transition-colors flex items-center gap-1 mb-6" style={{ color: "#aaa" }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to tasks
      </a>

      <div className="flex items-start justify-between mb-2">
        <h1 className="font-serif text-2xl text-text">{task.title}</h1>
        {task.status === "APPROVED" ? (
          <Badge variant="green">Complete</Badge>
        ) : task.status === "REJECTED" ? (
          <Badge variant="red">Action required</Badge>
        ) : task.status === "SUBMITTED" ? (
          <Badge variant="gold">Awaiting review</Badge>
        ) : task.isRequired ? (
          <Badge variant="red">Required</Badge>
        ) : (
          <Badge variant="muted">Optional</Badge>
        )}
      </div>

      {task.dueDate && (
        <p className="text-xs mb-6" style={{ color: "#aaa" }}>
          Due {new Date(task.dueDate).toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
        <p className="text-sm text-text leading-relaxed">{task.description}</p>
      </div>

      {task.status === "REJECTED" && task.reviewNote && (
        <div className="px-4 py-3 rounded-xl mb-4" style={{ borderLeft: "3px solid #c0392b", backgroundColor: "rgba(192,57,43,0.06)" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#c0392b" }}>Admissions feedback</p>
          <p className="text-sm text-text">{task.reviewNote}</p>
        </div>
      )}

      {task.status === "SUBMITTED" && (
        <div className="px-4 py-3 rounded-xl mb-4" style={{ borderLeft: "3px solid #C79A3B", backgroundColor: "rgba(199,154,59,0.06)" }}>
          <p className="text-sm text-text">Your submission is under review. You will be notified of the outcome.</p>
        </div>
      )}

      {task.status === "APPROVED" && (
        <div className="px-4 py-3 rounded-xl mb-4" style={{ borderLeft: "3px solid #22c55e", backgroundColor: "rgba(34,197,94,0.06)" }}>
          <p className="text-sm text-text">
            This task has been approved.
            {task.reviewNote && <> {task.reviewNote}</>}
          </p>
        </div>
      )}

      {task.documents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <div className="px-5 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#999" }}>Uploaded documents</p>
          </div>
          {task.documents.map((doc, i) => (
            <div
              key={doc.id}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: i < task.documents.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "#222" }}>{doc.filename}</p>
                <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
                  {new Date(doc.uploadedAt).toLocaleDateString("en-NZ")} ·{" "}
                  {doc.status === "VERIFIED" ? "Verified" : doc.status === "REJECTED" ? "Rejected" : "Pending review"}
                </p>
              </div>
              <a href={`/api/files/${doc.storageKey}`} className="text-xs font-semibold" style={{ color: "#114E3B" }}>
                View
              </a>
            </div>
          ))}
        </div>
      )}

      {canSubmit && (
        <TaskSubmitForm
          taskId={task.id}
          requiresDocument={task.requiresDocument}
          documentInstructions={task.documentInstructions}
          requiredDocumentCategory={task.requiredDocumentCategory}
          existingNote={task.studentNote}
        />
      )}
    </div>
  );
}