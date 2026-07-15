-- AlterTable
ALTER TABLE "TaskTemplate"
  ADD COLUMN "dueDays" INTEGER,
  ADD COLUMN "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "documentInstructions" TEXT;
