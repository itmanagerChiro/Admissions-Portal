import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@/generated/prisma/client";

interface LogAuditArgs {
  applicationId?: string;
  objectType: string;
  objectId: string;
  action: AuditAction;
  actionDetail: string;
  userId?: string;
}

export async function logAudit(args: LogAuditArgs) {
  await prisma.auditLog.create({
    data: {
      applicationId: args.applicationId,
      objectType: args.objectType,
      objectId: args.objectId,
      action: args.action,
      actionDetail: args.actionDetail,
      userId: args.userId,
    },
  });
}
