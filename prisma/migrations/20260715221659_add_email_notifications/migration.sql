-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmailTemplateKey" ADD VALUE 'STAGE_CHANGE_NOTIFICATION';
ALTER TYPE "EmailTemplateKey" ADD VALUE 'TASKS_ASSIGNED';
ALTER TYPE "EmailTemplateKey" ADD VALUE 'TASK_REMINDER';
ALTER TYPE "EmailTemplateKey" ADD VALUE 'TASKS_ALL_COMPLETE_ADMIN';

-- AlterEnum
ALTER TYPE "PermissionKey" ADD VALUE 'REMIND_TASK';

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
