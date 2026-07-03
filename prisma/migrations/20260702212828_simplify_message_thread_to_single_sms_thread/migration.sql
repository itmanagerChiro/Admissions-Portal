-- AlterTable
ALTER TABLE "MessageThread" DROP COLUMN "subject";

-- DropIndex
DROP INDEX IF EXISTS "MessageThread_applicationId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "MessageThread_applicationId_key" ON "MessageThread"("applicationId");
