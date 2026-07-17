import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";
import { StageAdvancer } from "./StageAdvancer";
import { SendReminderButton } from "./SendReminderButton";
import { EditApplicantForm } from "./EditApplicantForm";
import { MessagesChatWidget } from "./MessagesChatWidget";
import { TaskCompleteCheckbox } from "./TaskCompleteCheckbox";
import { DocumentVerifyButtons } from "./documents/DocumentVerifyButtons";
import Link from "next/link";
import type { ApplicationStageKey } from "@/generated/prisma/client";

const STAGE_VARIANTS: Record<ApplicationStageKey, "muted" | "blue" | "gold" | "red" | "green" | "olive" | "purple"> = {
  NEW_SUBMITTED: "muted",
  INTAKE_REVIEW: "blue",
  ACADEMIC_CHECK: "gold",
  INTERVIEW_AND_ESSAY: "blue",
  COMMITTEE: "red",
  OFFERED: "gold",
  ENROLLED: "olive",
};

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");
  requirePermission(session, "VIEW_APPLICANTS");

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      student: true,
      intakeYear: true,
      tasks: { where: { status: { not: "APPROVED" } }, orderBy: { createdAt: "desc" }, take: 5 },
      documents: { orderBy: { uploadedAt: "desc" }, take: 5 },
      messageThread: {
        include: { messages: { orderBy: { sentAt: "asc" } } },
      },
      timelineEvents: { orderBy: { occurredAt: "desc" }, take: 5 },
    },
  });

  if (!app) notFound();

  const canAdvance = hasPermission(session, "ADVANCE_APPLICATION_STAGE");
  const canAssignTasks = hasPermission(session, "ASSIGN_TASKS");
  const canSendMessages = hasPermission(session, "SEND_MESSAGES");
  const canViewDocs = hasPermission(session, "VIEW_DOCUMENTS");
  const canVerifyDocs = hasPermission(session, "VERIFY_DOCUMENTS");
  const canRemindTasks = hasPermission(session, "REMIND_TASK");
  const canEditProfile = hasPermission(session, "EDIT_APPLICANT_PROFILE");

  const currentIndex = STAGE_ORDER.indexOf(app.currentStage);

  return (
    <div className="px-8 py-7 max-w-4xl">
      {/* Breadcrumb */}
      <Link href="/admin/applicants" className="text-xs font-medium transition-colors hover:underline" style={{ color: "#114E3B" }}>
        ← All Applicants
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mt-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-3xl text-text">
              {app.student.firstName} {app.student.lastName}
            </h1>
            <Badge variant={STAGE_VARIANTS[app.currentStage]}>
              {STAGE_LABELS[app.currentStage]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#666" }}>
            <span className="font-mono">{app.applicantNumber}</span>
            <span>·</span>
            <span>{app.category === "DOMESTIC" ? "Domestic" : "International"}</span>
            <span>·</span>
            <span>Year {app.yearLevel === "YEAR_1" ? "1" : "2"}</span>
            <span>·</span>
            <span>{app.intakeYear.label}</span>
            {app.flagNote && (
              <>
                <span>·</span>
                <span className="font-semibold" style={{ color: "#c0392b" }}>{app.flagNote}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          {canRemindTasks && <SendReminderButton applicationId={app.id} />}
          {canAdvance && (
            <StageAdvancer
              applicationId={app.id}
              currentStage={app.currentStage}
            />
          )}
        </div>
      </div>

      {/* Stage progress bar */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          {STAGE_ORDER.map((stage, i) => {
            const isComplete = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: isComplete ? "#114E3B" : isCurrent ? "#C79A3B" : "rgba(0,0,0,0.08)",
                      color: isComplete || isCurrent ? "#fff" : "#aaa",
                    }}
                  >
                    {isComplete ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                </div>
                {i < STAGE_ORDER.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1"
                    style={{ backgroundColor: isComplete ? "#114E3B" : "rgba(0,0,0,0.08)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1">
          {STAGE_ORDER.map((stage, i) => {
            const isCurrent = i === currentIndex;
            return (
              <div key={stage} className="flex-1 text-center" style={{ minWidth: 0 }}>
                <span
                  className="text-[9px] font-semibold uppercase tracking-wide leading-tight block truncate px-0.5"
                  style={{ color: isCurrent ? "#C79A3B" : i < currentIndex ? "#114E3B" : "#bbb" }}
                >
                  {STAGE_LABELS[stage]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Application Details */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Application Details</p>
            {canEditProfile && (
              <EditApplicantForm
                applicationId={id}
                initial={{
                  firstName: app.student.firstName,
                  lastName: app.student.lastName,
                  email: app.student.email,
                  phone: app.phone ?? "",
                  city: app.city ?? "",
                  address: app.address ?? "",
                  postcode: app.postcode ?? "",
                  country: app.country ?? "",
                  guardianName: app.guardianName ?? "",
                  guardianEmail: app.guardianEmail ?? "",
                  guardianPhone: app.guardianPhone ?? "",
                }}
              />
            )}
          </div>
          <dl className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
            {[
              ["Email", app.student.email],
              ["Phone", app.phone ?? "—"],
              ["City", app.city ?? "—"],
              ["Submitted", app.submittedAt ? new Date(app.submittedAt).toLocaleDateString("en-NZ") : "—"],
              ["Guardian", app.guardianName ?? "—"],
            ].map(([k, v], i, arr) => (
              <div key={k} className="flex justify-between px-5 py-3 text-sm" style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                <dt style={{ color: "#666" }}>{k}</dt>
                <dd className="font-medium" style={{ color: "#222" }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Tasks</p>
            {canAssignTasks && (
              <Link href={`/admin/applicants/${id}/tasks`} className="text-xs font-semibold" style={{ color: "#114E3B" }}>Manage →</Link>
            )}
          </div>
          {app.tasks.length === 0 ? (
            <p className="px-5 py-4 text-xs" style={{ color: "#888" }}>No tasks assigned.</p>
          ) : (
            app.tasks.map((task, i) => (
              <div key={task.id} className="flex items-center justify-between px-5 py-3 text-xs" style={{ borderBottom: i < app.tasks.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                <span className="flex items-center gap-2.5 truncate max-w-[60%]">
                  {canAssignTasks && (
                    <TaskCompleteCheckbox
                      applicationId={id}
                      taskId={task.id}
                      isComplete={task.status === "APPROVED"}
                    />
                  )}
                  <span className="truncate" style={{ color: "#333" }}>{task.title}</span>
                </span>
                <Badge variant={task.status === "APPROVED" ? "green" : task.status === "REJECTED" ? "red" : task.status === "SUBMITTED" ? "gold" : "muted"}>
                  {task.status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                </Badge>
              </div>
            ))
          )}
        </div>

        {/* Documents */}
        {canViewDocs && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Documents</p>
              <Link href={`/admin/applicants/${id}/documents`} className="text-xs font-semibold" style={{ color: "#114E3B" }}>View all →</Link>
            </div>
            {app.documents.length === 0 ? (
              <p className="px-5 py-4 text-xs" style={{ color: "#888" }}>No documents uploaded.</p>
            ) : (
              app.documents.map((doc, i) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 px-5 py-3 text-xs" style={{ borderBottom: i < app.documents.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}>
                  <span className="truncate max-w-[45%]" style={{ color: "#333" }}>{doc.filename}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canVerifyDocs && doc.status === "PENDING_REVIEW" ? (
                      <DocumentVerifyButtons documentId={doc.id} applicationId={id} />
                    ) : (
                      <Badge variant={doc.status === "VERIFIED" ? "green" : doc.status === "REJECTED" ? "red" : "muted"}>
                        {doc.status.replace("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Messages */}
      {canSendMessages && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: "#555" }}>Conversation</p>
          <MessagesChatWidget
            applicationId={id}
            studentFirstName={app.student.firstName}
            thread={app.messageThread ?? null}
          />
        </div>
      )}

      {/* Sub-page nav */}
      <div className="flex gap-2 mt-6">
        {[
          { href: `/admin/applicants/${id}/tasks`, label: "Tasks" },
          ...(canViewDocs ? [{ href: `/admin/applicants/${id}/documents`, label: "Documents" }] : []),
          { href: `/admin/applicants/${id}/timeline`, label: "Timeline" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-white shadow-sm"
            style={{ color: "#555" }}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}