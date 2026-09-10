-- CreateEnum
CREATE TYPE "InterviewFormat" AS ENUM ('ONLINE', 'IN_PERSON');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "gpaScore" DOUBLE PRECISION,
ADD COLUMN     "prerequisiteNotes" TEXT,
ADD COLUMN     "prerequisitesMet" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "InterviewReview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "score" INTEGER,
    "notes" TEXT,
    "interviewDate" TIMESTAMP(3),
    "format" "InterviewFormat",
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EssayReview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "score" INTEGER,
    "notes" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewReview_applicationId_key" ON "InterviewReview"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "EssayReview_applicationId_key" ON "EssayReview"("applicationId");

-- AddForeignKey
ALTER TABLE "InterviewReview" ADD CONSTRAINT "InterviewReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewReview" ADD CONSTRAINT "InterviewReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayReview" ADD CONSTRAINT "EssayReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayReview" ADD CONSTRAINT "EssayReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

