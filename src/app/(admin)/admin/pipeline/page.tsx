import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { WipBanner } from "@/components/ui/WipBanner";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/stages";
import { resolveIntakeFilter } from "@/lib/intakeYears";
import Link from "next/link";
import { PipelineBoard } from "./PipelineBoard";
import { IntakeFilterPicker } from "@/components/admin/IntakeFilterPicker";

const STAGE_BADGE_VARIANT: Record<string, "olive" | "gold" | "blue" | "green" | "muted" | "purple"> = {
  NEW_SUBMITTED: "muted",
  INTAKE_REVIEW: "blue",
  ACADEMIC_CHECK: "purple",
  INTERVIEW: "gold",
  ESSAY: "gold",
  COMMITTEE: "gold",
  OFFER_CONDITIONAL: "green",
  OFFER_UNCONDITIONAL: "green",
  ACCEPTED: "green",
  ENROLLED: "olive",
};

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; intake?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");
  requirePermission(session, "VIEW_APPLICANTS");

  const { filter, intake } = await searchParams;
  const canDrag = hasPermission(session, "ADVANCE_APPLICATION_STAGE");

  const intakeFilter = await resolveIntakeFilter(intake);

  const applications = await prisma.application.findMany({
    where: {
      ...intakeFilter.where,
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
      <div className="px-8 pt-5">
        <WipBanner>This page is work in progress. Some logic has been implemented.</WipBanner>
      </div>
      <div className="px-8 py-5 border-b flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-text">Admissions Pipeline</h1>
          <p className="text-sm text-text-muted mt-0.5">{applications.length} applicants · {intakeFilter.label}</p>
        </div>
        <div className="flex items-center gap-2">
          <IntakeFilterPicker intakeYears={intakeFilter.visibleIntakes.map((iy) => ({ id: iy.id, label: iy.label }))} />
          {(["ALL", "DOMESTIC", "INTERNATIONAL"] as const).map((f) => (
            <Link
              key={f}
              href={{
                pathname: "/admin/pipeline",
                query: { ...(f !== "ALL" ? { filter: f } : {}), ...(intake ? { intake } : {}) },
              }}
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
