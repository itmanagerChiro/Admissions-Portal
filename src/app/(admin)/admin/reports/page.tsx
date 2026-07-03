import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/stages";
import { ReportsCharts } from "./ReportsCharts";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");
  requirePermission(session, "VIEW_REPORTS");

  const activeIntake = await prisma.intakeYear.findFirst({ where: { isActive: true } });

  const baseWhere = activeIntake ? { intakeYearId: activeIntake.id } : {};

  const [allApps, domestic, international, year1, year2] = await Promise.all([
    prisma.application.findMany({
      where: baseWhere,
      select: { currentStage: true, category: true, yearLevel: true },
    }),
    prisma.application.count({ where: { ...baseWhere, category: "DOMESTIC" } }),
    prisma.application.count({ where: { ...baseWhere, category: "INTERNATIONAL" } }),
    prisma.application.count({ where: { ...baseWhere, yearLevel: "YEAR_1" } }),
    prisma.application.count({ where: { ...baseWhere, yearLevel: "YEAR_2" } }),
  ]);

  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: allApps.filter((a) => a.currentStage === stage).length,
  }));

  const categoryData = [
    { label: "Domestic", count: domestic },
    { label: "International", count: international },
    { label: "Year 1 Entry", count: year1 },
    { label: "Year 2 Entry", count: year2 },
  ];

  const funnelData = STAGE_ORDER.map((stage, i) => {
    const count = allApps.filter((a) => STAGE_ORDER.indexOf(a.currentStage) >= i).length;
    return { label: STAGE_LABELS[stage], count };
  });

  return (
    <div className="px-8 py-7 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-text">Reports &amp; Insights</h1>
          <p className="text-sm text-text-muted mt-1">Live snapshot of pipeline health and conversion rates.</p>
        </div>
        <span className="px-4 py-2 bg-green-dark text-white text-xs font-semibold tracking-wide cursor-pointer hover:bg-green transition-colors">
          EXPORT PDF
        </span>
      </div>

      <ReportsCharts byStage={byStage} categoryData={categoryData} funnelData={funnelData} total={allApps.length} />
    </div>
  );
}
