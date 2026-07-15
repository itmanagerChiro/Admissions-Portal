import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { NotImplementedButton } from "@/components/ui/NotImplementedButton";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";
import { ApplicantsControls } from "./ApplicantsControls";
import type { ApplicationStageKey, Prisma } from "@/generated/prisma/client";

const STAGE_VARIANTS: Record<ApplicationStageKey, "muted" | "blue" | "gold" | "red" | "green" | "olive" | "purple"> = {
  NEW_SUBMITTED: "muted",
  INTAKE_REVIEW: "blue",
  ACADEMIC_CHECK: "gold",
  INTERVIEW_AND_ESSAY: "blue",
  COMMITTEE: "red",
  OFFERED: "gold",
  ENROLLED: "olive",
};

function buildOrderBy(sort: string): Prisma.ApplicationOrderByWithRelationInput[] {
  switch (sort) {
    case "name_asc":    return [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }];
    case "name_desc":   return [{ student: { lastName: "desc" } }, { student: { firstName: "desc" } }];
    case "createdAt_asc":  return [{ createdAt: "asc" }];
    case "createdAt_desc": return [{ createdAt: "desc" }];
    case "updatedAt_asc":  return [{ updatedAt: "asc" }];
    case "stage_asc":
    case "stage_desc": return [{ updatedAt: "desc" }]; // stage sorted client-side below
    default:            return [{ updatedAt: "desc" }];
  }
}

export default async function AllApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; stage?: string; type?: string; year?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort ?? "updatedAt_desc";
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");
  requirePermission(session, "VIEW_APPLICANTS");

  const activeIntake = await prisma.intakeYear.findFirst({ where: { isActive: true } });

  const where: Prisma.ApplicationWhereInput = {
    ...(activeIntake ? { intakeYearId: activeIntake.id } : {}),
    ...(params.stage ? { currentStage: params.stage as ApplicationStageKey } : {}),
    ...(params.type === "DOMESTIC" || params.type === "INTERNATIONAL" ? { category: params.type } : {}),
    ...(params.year === "YEAR_1" || params.year === "YEAR_2" ? { yearLevel: params.year } : {}),
    ...(params.search
      ? {
          OR: [
            { student: { firstName: { contains: params.search, mode: "insensitive" } } },
            { student: { lastName: { contains: params.search, mode: "insensitive" } } },
            { student: { email: { contains: params.search, mode: "insensitive" } } },
            { applicantNumber: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  let applications = await prisma.application.findMany({
    where,
    orderBy: buildOrderBy(sort),
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      stageHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { advancedBy: { select: { firstName: true, lastName: true } } },
      },
    },
    take: 200,
  });

  // Stage sort requires in-memory ordering since stage is an enum not a number
  if (sort === "stage_asc") {
    applications = [...applications].sort((a, b) => STAGE_ORDER.indexOf(a.currentStage) - STAGE_ORDER.indexOf(b.currentStage));
  } else if (sort === "stage_desc") {
    applications = [...applications].sort((a, b) => STAGE_ORDER.indexOf(b.currentStage) - STAGE_ORDER.indexOf(a.currentStage));
  }

  const STAGES = STAGE_ORDER.map((s) => ({ value: s, label: STAGE_LABELS[s] }));

  return (
    <div className="px-8 py-7">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">
        {activeIntake?.label ?? "Intake"}
      </p>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-serif text-3xl text-text">All Applicants</h1>
          <p className="text-sm text-text-muted mt-1">
            {applications.length} application{applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-white shadow-sm text-sm font-medium text-text-muted hover:text-green transition-colors">
            Export
          </button>
          <NotImplementedButton className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            + New
          </NotImplementedButton>
        </div>
      </div>

      <ApplicantsControls
        stages={STAGES}
        defaultSearch={params.search}
        defaultStage={params.stage}
        defaultType={params.type}
        defaultYear={params.year}
        defaultSort={sort}
      />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
              {["Name", "ID", "Type", "Stage", "Last edited by", "Updated", "Flags", ""].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#999" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((app, i) => {
              const lastEdit = app.stageHistory[0];
              const lastEditorName = lastEdit
                ? `${lastEdit.advancedBy.firstName} ${lastEdit.advancedBy.lastName}`
                : "System";
              const lastEditDate = lastEdit
                ? new Date(lastEdit.createdAt)
                : new Date(app.updatedAt);

              return (
                <tr
                  key={app.id}
                  className="applicant-row group transition-colors cursor-pointer"
                  style={{ borderBottom: i < applications.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  <td className="px-5 py-4 applicant-accent-cell" style={{ borderLeft: "3px solid transparent", transition: "border-color 0.15s" }}>
                    <Link href={`/admin/applicants/${app.id}`} className="block">
                      <span className="text-sm font-semibold" style={{ color: "#222" }}>
                        {app.student.firstName} {app.student.lastName}
                      </span>
                      <span className="block text-xs mt-0.5" style={{ color: "#888" }}>{app.student.email}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono" style={{ color: "#888" }}>{app.applicantNumber}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: app.category === "INTERNATIONAL" ? "#2563EB" : "#555" }}>
                    {app.category === "DOMESTIC" ? "Domestic" : "Intl"}
                    <span className="block" style={{ color: "#aaa" }}>Yr {app.yearLevel === "YEAR_1" ? "1" : "2"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={STAGE_VARIANTS[app.currentStage]}>
                      {STAGE_LABELS[app.currentStage]}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium block" style={{ color: "#333" }}>{lastEditorName}</span>
                    <span className="text-xs block mt-0.5" style={{ color: "#aaa" }}>
                      {lastEditDate.toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                      {" "}
                      {lastEditDate.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "#aaa" }}>
                    {new Date(app.updatedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-5 py-4">
                    {app.flagNote && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(199,154,59,0.1)", color: "#a07820" }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#C79A3B" }} />
                        {app.flagNote}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/applicants/${app.id}`} className="text-xs font-semibold" style={{ color: "#114E3B" }}>
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div className="px-8 py-16 text-center text-sm" style={{ color: "#aaa" }}>No applicants found.</div>
        )}
      </div>
    </div>
  );
}
