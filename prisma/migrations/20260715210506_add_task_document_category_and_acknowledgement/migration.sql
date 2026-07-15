-- CreateEnum
CREATE TYPE "RequiredDocumentCategory" AS ENUM ('ANY', 'DOCUMENT', 'IMAGE');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "acknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "acknowledgedById" TEXT,
ADD COLUMN     "requiredDocumentCategory" "RequiredDocumentCategory" NOT NULL DEFAULT 'ANY';

-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN     "requiredDocumentCategory" "RequiredDocumentCategory" NOT NULL DEFAULT 'ANY';

-- CreateIndex
CREATE INDEX "Task_status_acknowledgedAt_idx" ON "Task"("status", "acknowledgedAt");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
