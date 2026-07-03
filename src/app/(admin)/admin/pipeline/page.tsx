import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/stages";
import Link from "next/link";
import { PipelineBoard } from "./PipelineBoard";

const STAGE_BADGE_VARIANT: Record<string, "olive" | "gold" | "blue" | "green" | "muted" | "purple"> = {
  NEW_SUBMITTED: "muted",
  INTAKE_REVIEW: "blue",
  ACADEMIC_CHECK: "purple",
  INTERVIEW_AND_ESSAY: "gold",
  COMMITTEE: "gold",
  OFFERED: "green",
  ENROLLED: "olive",
};

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");
  requirePermission(session, "VIEW_APPLICANTS");

  const { filter } = await searchParams;
  const canDrag = hasPermission(session, "ADVANCE_APPLICATION_STAGE");

  const activeIntake = await prisma.intakeYear.findFirst({ where: { isActive: true } });

  const applications = await prisma.application.findMany({
    where: {
      ...(activeIntake ? { intakeYearId: activeIntake.id } : {}),
      ...(filter === "DOMESTIC" ? { category: "DOMESTIC" } : {}),
      ...(filter === "INTERNATIONAL" ? { category: "INTERNATIONAL" } : {}),
    },
    select: {
      id: true,
      applicantNumber: true,
      currentStage: true,
      category: true,
      yearLevel: true,
      flagNote: true,
      sortOrder: true,
      updatedAt: true,
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  const columns = STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    applications: applications.filter((a) => a.currentStage === stage),
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-5 border-b flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-text">Admissions Pipeline</h1>
          <p className="text-sm text-text-muted mt-0.5">{applications.length} applicants · {activeIntake?.label ?? "No active intake"}</p>
        </div>
        <div className="flex items-center gap-2">
          {(["ALL", "DOMESTIC", "INTERNATIONAL"] as const).map((f) => (
            <Link
              key={f}
              href={f === "ALL" ? "/admin/pipeline" : `/admin/pipeline?filter=${f}`}
              className={[
                "px-3 py-1.5 text-xs font-semibold transition-colors",
                (filter === f || (!filter && f === "ALL"))
                  ? "bg-green text-white"
                  : "bg-white text-text-muted hover:text-green",
              ].join(" ")}
            >
              {f}
            </Link>
          ))}
        </div>
      </div>

      <PipelineBoard columns={columns} canDrag={canDrag} />
    </div>
  );
}
