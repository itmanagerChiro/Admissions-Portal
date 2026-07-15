-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "reviewedById" TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
