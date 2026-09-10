-- AlterEnum
ALTER TYPE "EmailTemplateKey" ADD VALUE 'ACCOUNT_DELETION_REQUESTED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3);

