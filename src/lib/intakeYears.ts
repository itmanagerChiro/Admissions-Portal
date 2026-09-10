import { prisma } from "@/lib/prisma";

export async function getVisibleIntakeYears() {
  return prisma.intakeYear.findMany({
    where: { isVisible: true, isArchived: false },
    orderBy: { year: "desc" },
  });
}

/**
 * Resolves the intake-year filter for staff list/report pages.
 * `intakeParam` is the `?intake=` query value: a specific IntakeYear id, or
 * undefined/"all" to mean "all visible, non-archived intakes combined".
 */
export async function resolveIntakeFilter(intakeParam: string | undefined) {
  const visibleIntakes = await getVisibleIntakeYears();

  if (intakeParam && intakeParam !== "all") {
    const selected = visibleIntakes.find((iy) => iy.id === intakeParam);
    if (selected) {
      return { where: { intakeYearId: selected.id }, label: selected.label, visibleIntakes, selectedId: selected.id };
    }
  }

  return {
    where: visibleIntakes.length > 0 ? { intakeYearId: { in: visibleIntakes.map((iy) => iy.id) } } : {},
    label: "All Visible Intakes",
    visibleIntakes,
    selectedId: "all" as const,
  };
}
