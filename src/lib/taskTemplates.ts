import { prisma } from "@/lib/prisma";
import type { ApplicationStageKey } from "@/generated/prisma/client";

/**
 * Creates Task rows from active TaskTemplates for the given stage, skipping
 * templates that already have a Task for this application (so re-entering a
 * stage doesn't spam duplicates alongside whatever the caller chose to keep).
 */
export async function generateTasksForStage(
  applicationId: string,
  stageKey: ApplicationStageKey,
  staffId: string
) {
  const [templates, existing] = await Promise.all([
    prisma.taskTemplate.findMany({
      where: { stageKey, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.task.findMany({
      where: { applicationId, stageKey },
      select: { templateId: true },
    }),
  ]);

  const existingTemplateIds = new Set(existing.map((t) => t.templateId).filter(Boolean));
  const toCreate = templates.filter((t) => !existingTemplateIds.has(t.id));
  if (toCreate.length === 0) return [];

  return prisma.$transaction(
    toCreate.map((template) =>
      prisma.task.create({
        data: {
          applicationId,
          templateId: template.id,
          stageKey,
          title: template.title,
          description: template.description,
          audience: template.audience,
          assignedById: staffId,
          dueDate: template.dueDays != null ? addDays(new Date(), template.dueDays) : null,
          requiresDocument: template.requiresDocument,
          documentInstructions: template.documentInstructions,
          requiredDocumentCategory: template.requiredDocumentCategory,
        },
      })
    )
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
