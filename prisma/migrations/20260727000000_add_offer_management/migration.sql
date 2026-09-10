-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('CONDITIONAL', 'UNCONDITIONAL');

-- CreateEnum
CREATE TYPE "OfferResponseStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OfferConditionStatus" AS ENUM ('PENDING', 'SATISFIED', 'WAIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStageKey_new" AS ENUM ('NEW_SUBMITTED', 'INTAKE_REVIEW', 'ACADEMIC_CHECK', 'INTERVIEW_AND_ESSAY', 'COMMITTEE', 'OFFER_CONDITIONAL', 'OFFER_UNCONDITIONAL', 'ACCEPTED', 'ENROLLED');
ALTER TABLE "public"."Application" ALTER COLUMN "currentStage" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "currentStage" TYPE "ApplicationStageKey_new" USING ("currentStage"::text::"ApplicationStageKey_new");
ALTER TABLE "ApplicationStageHistory" ALTER COLUMN "fromStage" TYPE "ApplicationStageKey_new" USING ("fromStage"::text::"ApplicationStageKey_new");
ALTER TABLE "ApplicationStageHistory" ALTER COLUMN "toStage" TYPE "ApplicationStageKey_new" USING ("toStage"::text::"ApplicationStageKey_new");
ALTER TABLE "TaskTemplate" ALTER COLUMN "stageKey" TYPE "ApplicationStageKey_new" USING ("stageKey"::text::"ApplicationStageKey_new");
ALTER TABLE "Task" ALTER COLUMN "stageKey" TYPE "ApplicationStageKey_new" USING ("stageKey"::text::"ApplicationStageKey_new");
ALTER TABLE "TimelineEvent" ALTER COLUMN "relatedStageKey" TYPE "ApplicationStageKey_new" USING ("relatedStageKey"::text::"ApplicationStageKey_new");
ALTER TYPE "ApplicationStageKey" RENAME TO "ApplicationStageKey_old";
ALTER TYPE "ApplicationStageKey_new" RENAME TO "ApplicationStageKey";
DROP TYPE "public"."ApplicationStageKey_old";
ALTER TABLE "Application" ALTER COLUMN "currentStage" SET DEFAULT 'NEW_SUBMITTED';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TimelineEventType" ADD VALUE 'OFFER_ACCEPTED';
ALTER TYPE "TimelineEventType" ADD VALUE 'OFFER_DECLINED';
ALTER TYPE "TimelineEventType" ADD VALUE 'OFFER_CONDITION_SATISFIED';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "offerConditionId" TEXT;

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "type" "OfferType" NOT NULL,
    "issuedById" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptanceDeadline" TIMESTAMP(3),
    "responseStatus" "OfferResponseStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "offerLetterReference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferCondition" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "conditionText" TEXT NOT NULL,
    "isStandard" BOOLEAN NOT NULL DEFAULT true,
    "status" "OfferConditionStatus" NOT NULL DEFAULT 'PENDING',
    "satisfiedAt" TIMESTAMP(3),
    "satisfiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfferCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Offer_applicationId_idx" ON "Offer"("applicationId");

-- CreateIndex
CREATE INDEX "Offer_responseStatus_idx" ON "Offer"("responseStatus");

-- CreateIndex
CREATE INDEX "OfferCondition_offerId_idx" ON "OfferCondition"("offerId");

-- CreateIndex
CREATE INDEX "OfferCondition_status_idx" ON "OfferCondition"("status");

-- CreateIndex
CREATE INDEX "Document_offerConditionId_idx" ON "Document"("offerConditionId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_offerConditionId_fkey" FOREIGN KEY ("offerConditionId") REFERENCES "OfferCondition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferCondition" ADD CONSTRAINT "OfferCondition_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferCondition" ADD CONSTRAINT "OfferCondition_satisfiedById_fkey" FOREIGN KEY ("satisfiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

