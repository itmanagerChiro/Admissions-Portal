-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'DIVERSE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaoriPacificaStatus" AS ENUM ('NEITHER', 'MAORI', 'PACIFICA', 'BOTH');

-- CreateEnum
CREATE TYPE "EnglishProficiencyStatus" AS ENUM ('FIRST_LANGUAGE', 'IELTS_BOOKED', 'IELTS_CERTIFIED', 'HANDBOOK_MET');

-- CreateEnum
CREATE TYPE "ReferralSource" AS ENUM ('ADVERTISEMENT', 'CAREER_FAIR', 'ADVISOR', 'INTERNET', 'EXPO', 'SOCIAL_MEDIA', 'CHIROPRACTOR', 'NZCC_ALUMNUS', 'FRIEND_FAMILY', 'FACULTY_STAFF', 'OTHER');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('SECONDARY', 'TERTIARY');

-- CreateEnum
CREATE TYPE "ChiropracticExperienceStatus" AS ENUM ('OBSERVING', 'UNDER_CARE');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "alternativeAddress" TEXT,
ADD COLUMN     "alternativeCity" TEXT,
ADD COLUMN     "alternativeCountry" TEXT,
ADD COLUMN     "alternativePostcode" TEXT,
ADD COLUMN     "alternativeSuburb" TEXT,
ADD COLUMN     "citizenshipCountry" TEXT,
ADD COLUMN     "declarationAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "declarationSignatureName" TEXT,
ADD COLUMN     "disabilitySupportCategory" TEXT,
ADD COLUMN     "englishProficiencyDetails" TEXT,
ADD COLUMN     "englishProficiencyStatus" "EnglishProficiencyStatus",
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "hasCompletedTertiaryStudy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasCriminalConviction" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasDisabilitySupportNeed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasDishonestyAllegations" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPendingLegalProceedings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPriorAcademicIssues" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasPriorComplaints" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ieltsTestDate" TIMESTAMP(3),
ADD COLUMN     "maoriPacificaStatus" "MaoriPacificaStatus",
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "nationalStudentNumber" TEXT,
ADD COLUMN     "personalStatement" TEXT,
ADD COLUMN     "preferredFirstName" TEXT,
ADD COLUMN     "preferredPronouns" TEXT,
ADD COLUMN     "referralSource" "ReferralSource",
ADD COLUMN     "useAlternativeAddress" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EducationHistoryEntry" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "institutionName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "yearStarted" INTEGER NOT NULL,
    "qualification" TEXT,
    "yearCompleted" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationHistoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiropracticExperienceEntry" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "chiropractorName" TEXT NOT NULL,
    "status" "ChiropracticExperienceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChiropracticExperienceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EducationHistoryEntry_applicationId_idx" ON "EducationHistoryEntry"("applicationId");

-- CreateIndex
CREATE INDEX "ChiropracticExperienceEntry_applicationId_idx" ON "ChiropracticExperienceEntry"("applicationId");

-- AddForeignKey
ALTER TABLE "EducationHistoryEntry" ADD CONSTRAINT "EducationHistoryEntry_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiropracticExperienceEntry" ADD CONSTRAINT "ChiropracticExperienceEntry_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

