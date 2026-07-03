import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProgressTracker } from "@/components/student/ProgressTracker";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    include: {
      intakeYear: true,
      tasks: {
        where: { status: { in: ["PENDING", "IN_PROGRESS", "REJECTED"] } },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 6,
      },
      messageThread: {
        include: {
          messages: {
            where: { isRead: false, senderRole: "STAFF" },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!application) {
    return <div className="p-8 text-text-muted">Application not found.</div>;
  }

  const unreadCount = application.messageThread?.messages.length ?? 0;
  const stageIndex = STAGE_ORDER.indexOf(application.currentStage);

  return (
    <div className="px-8 py-8 max-w-4xl">
      {/* Header */}
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">
        {getGreeting()}
      </p>
      <h1 className="font-serif text-4xl text-text mb-2">
        Kia ora, {session.user.firstName}
      </h1>
      {application.tasks.length > 0 && (
        <p className="text-text-muted text-sm">
          You have {application.tasks.length} task{application.tasks.length !== 1 ? "s" : ""} requiring attention
          {application.tasks[0]?.dueDate ? ` before your ${STAGE_LABELS[application.currentStage].toLowerCase()}` : ""}.
        </p>
      )}

      {/* Alert banner */}
      {(unreadCount > 0 || application.tasks.some((t) => t.dueDate && new Date(t.dueDate) < new Date())) && (
        <div className="mt-5 px-4 py-3 flex items-start gap-3 rounded-xl" style={{ backgroundColor: "rgba(199,154,59,0.08)", borderLeft: "3px solid #C79A3B" }}>
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#C79A3B" }}>
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-text">
            <strong>Action needed:</strong>{" "}
            {application.tasks.find((t) => t.dueDate)
              ? `Your ${application.tasks.find((t) => t.dueDate)?.title?.toLowerCase()} is due soon. Please complete it before the deadline.`
              : `You have ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""} from the admissions team.`}
          </p>
        </div>
      )}

      {/* Progress tracker */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-lg text-text">Your Application Progress</h2>
          <Badge variant="muted">
            Stage {stageIndex + 1} of {STAGE_ORDER.length} · {STAGE_LABELS[application.currentStage]}
          </Badge>
        </div>
        <ProgressTracker currentStage={application.currentStage} />
      </div>

      {/* Tasks */}
      {application.tasks.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-4">
            What needs your attention
          </p>
          <div className="grid grid-cols-2 gap-4">
            {application.tasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
              const isRejected = task.status === "REJECTED";
              return (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div
                    className="h-full bg-white rounded-xl shadow-sm p-5 transition-colors"
                    style={{ borderLeft: `3px solid ${isOverdue || isRejected ? "#c0392b" : task.dueDate ? "#C79A3B" : "#114E3B"}` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#F2F2F0" }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#aaa" }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      {isOverdue || isRejected ? (
                        <Badge variant="red">{isRejected ? "Action required" : "Overdue"}</Badge>
                      ) : task.dueDate ? (
                        <Badge variant="gold">Due {new Date(task.dueDate).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</Badge>
                      ) : task.isRequired ? (
                        <Badge variant="red">Required</Badge>
                      ) : null}
                    </div>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: "#222" }}>{task.title}</h3>
                    <p className="text-xs line-clamp-2" style={{ color: "#aaa" }}>{task.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Application summary */}
      <div className="mt-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-3">Application Summary</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {[
            ["Applicant type", `${application.category === "DOMESTIC" ? "Domestic" : "International"} · Year ${application.yearLevel === "YEAR_1" ? "1" : "2"}`],
            ["Current stage", STAGE_LABELS[application.currentStage]],
            ["Applicant number", application.applicantNumber],
            ["Application submitted", application.submittedAt ? new Date(application.submittedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" }) : "—"],
            ["Intake year", application.intakeYear.label],
          ].map(([label, value], i, arr) => (
            <div
              key={label}
              className="flex justify-between px-5 py-3.5 text-sm"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
            >
              <dt style={{ color: "#aaa" }}>{label}</dt>
              <dd className="font-medium" style={{ color: "#222" }}>{value}</dd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
