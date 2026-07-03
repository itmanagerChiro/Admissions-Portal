import "server-only";
import { prisma } from "@/lib/prisma";
import type { TimelineEventType, ApplicationStageKey } from "@/generated/prisma/client";
export { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";

interface CreateTimelineEventArgs {
  applicationId: string;
  eventType: TimelineEventType;
  title: string;
  description?: string;
  isVisibleToStudent?: boolean;
  relatedTaskId?: string;
  relatedDocumentId?: string;
  relatedStageKey?: ApplicationStageKey;
  createdById?: string;
}

export async function createTimelineEvent(args: CreateTimelineEventArgs) {
  return prisma.timelineEvent.create({
    data: {
      applicationId: args.applicationId,
      eventType: args.eventType,
      title: args.title,
      description: args.description,
      isVisibleToStudent: args.isVisibleToStudent ?? true,
      relatedTaskId: args.relatedTaskId,
      relatedDocumentId: args.relatedDocumentId,
      relatedStageKey: args.relatedStageKey,
      createdById: args.createdById,
    },
  });
}

