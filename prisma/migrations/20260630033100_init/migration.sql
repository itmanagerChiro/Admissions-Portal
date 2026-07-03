-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'STAFF');

-- CreateEnum
CREATE TYPE "StudentCategory" AS ENUM ('DOMESTIC', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "YearLevel" AS ENUM ('YEAR_1', 'YEAR_2');

-- CreateEnum
CREATE TYPE "ApplicationStageKey" AS ENUM ('NEW_SUBMITTED', 'INTAKE_REVIEW', 'ACADEMIC_CHECK', 'INTERVIEW_AND_ESSAY', 'COMMITTEE', 'OFFERED', 'ENROLLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('IN_PROGRESS', 'UNDER_REVIEW', 'OFFER_MADE', 'OFFER_ACCEPTED', 'ENROLLED', 'WITHDRAWN', 'DECLINED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StaffTaskStatus" AS ENUM ('PENDING', 'COMPLETE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MessageSenderRole" AS ENUM ('STUDENT', 'STAFF');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('STAGE_CHANGE', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_REJECTED', 'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED', 'MESSAGE_SENT', 'NOTE_ADDED', 'OFFER_ISSUED', 'ENROLMENT_CONFIRMED');

-- CreateEnum
CREATE TYPE "PermissionKey" AS ENUM ('VIEW_APPLICANTS', 'EDIT_APPLICANT_PROFILE', 'ADVANCE_APPLICATION_STAGE', 'WITHDRAW_APPLICATION', 'ASSIGN_TASKS', 'REVIEW_TASK_SUBMISSIONS', 'DELETE_TASKS', 'MANAGE_OWN_TASKS', 'REQUEST_DOCUMENTS', 'VIEW_DOCUMENTS', 'VERIFY_DOCUMENTS', 'DELETE_DOCUMENTS', 'SEND_MESSAGES', 'VIEW_ALL_MESSAGES', 'VIEW_INTERNATIONAL', 'EDIT_INTERNATIONAL', 'MANAGE_STAFF_USERS', 'MANAGE_PERMISSIONS', 'VIEW_REPORTS');

-- CreateEnum
CREATE TYPE "VisaStatus" AS ENUM ('NOT_YET', 'APPLIED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "IeltsStatus" AS ENUM ('NOT_YET', 'IN_PROGRESS', 'CONFIRMED', 'WAIVED', 'REQUIRED');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('NOT_YET', 'CONFIRMED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isGlobalAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntakeYear" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntakeYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "intakeYearId" TEXT NOT NULL,
    "applicantNumber" TEXT NOT NULL,
    "category" "StudentCategory" NOT NULL,
    "yearLevel" "YearLevel" NOT NULL,
    "currentStage" "ApplicationStageKey" NOT NULL DEFAULT 'NEW_SUBMITTED',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "flagNote" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "phone" TEXT,
    "address" TEXT,
    "suburb" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "country" TEXT,
    "currentSchool" TEXT,
    "nceaLevel" TEXT,
    "guardianName" TEXT,
    "guardianEmail" TEXT,
    "guardianPhone" TEXT,
    "guardianRelation" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternationalCompliance" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "offerOfPlaceIssued" BOOLEAN NOT NULL DEFAULT false,
    "visaStatus" "VisaStatus" NOT NULL DEFAULT 'NOT_YET',
    "healthInsuranceStatus" "InsuranceStatus" NOT NULL DEFAULT 'NOT_YET',
    "ieltsStatus" "IeltsStatus" NOT NULL DEFAULT 'NOT_YET',
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternationalCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationStageHistory" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStage" "ApplicationStageKey",
    "toStage" "ApplicationStageKey" NOT NULL,
    "advancedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "requiresDocument" BOOLEAN NOT NULL DEFAULT false,
    "documentInstructions" TEXT,
    "assignedById" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "studentNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffTask" (
    "id" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "applicationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StaffTaskStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "taskId" TEXT,
    "filename" TEXT NOT NULL,
    "storedFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "documentType" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationNote" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageThread" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderRole" "MessageSenderRole" NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "eventType" "TimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isVisibleToStudent" BOOLEAN NOT NULL DEFAULT true,
    "relatedTaskId" TEXT,
    "relatedDocumentId" TEXT,
    "relatedStageKey" "ApplicationStageKey",
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffPermission" (
    "id" TEXT NOT NULL,
    "staffUserId" TEXT NOT NULL,
    "permissionKey" "PermissionKey" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "IntakeYear_year_key" ON "IntakeYear"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_key" ON "Application"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicantNumber_key" ON "Application"("applicantNumber");

-- CreateIndex
CREATE INDEX "Application_intakeYearId_idx" ON "Application"("intakeYearId");

-- CreateIndex
CREATE INDEX "Application_currentStage_idx" ON "Application"("currentStage");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_category_idx" ON "Application"("category");

-- CreateIndex
CREATE UNIQUE INDEX "InternationalCompliance_applicationId_key" ON "InternationalCompliance"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationStageHistory_applicationId_idx" ON "ApplicationStageHistory"("applicationId");

-- CreateIndex
CREATE INDEX "Task_applicationId_idx" ON "Task"("applicationId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "StaffTask_assignedToId_idx" ON "StaffTask"("assignedToId");

-- CreateIndex
CREATE INDEX "StaffTask_status_idx" ON "StaffTask"("status");

-- CreateIndex
CREATE INDEX "StaffTask_dueDate_idx" ON "StaffTask"("dueDate");

-- CreateIndex
CREATE INDEX "Document_applicationId_idx" ON "Document"("applicationId");

-- CreateIndex
CREATE INDEX "Document_taskId_idx" ON "Document"("taskId");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "MessageThread_applicationId_idx" ON "MessageThread"("applicationId");

-- CreateIndex
CREATE INDEX "Message_threadId_idx" ON "Message"("threadId");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "Message"("isRead");

-- CreateIndex
CREATE INDEX "TimelineEvent_applicationId_idx" ON "TimelineEvent"("applicationId");

-- CreateIndex
CREATE INDEX "TimelineEvent_occurredAt_idx" ON "TimelineEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "StaffPermission_staffUserId_idx" ON "StaffPermission"("staffUserId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffPermission_staffUserId_permissionKey_key" ON "StaffPermission"("staffUserId", "permissionKey");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_intakeYearId_fkey" FOREIGN KEY ("intakeYearId") REFERENCES "IntakeYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternationalCompliance" ADD CONSTRAINT "InternationalCompliance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStageHistory" ADD CONSTRAINT "ApplicationStageHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStageHistory" ADD CONSTRAINT "ApplicationStageHistory_advancedById_fkey" FOREIGN KEY ("advancedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTask" ADD CONSTRAINT "StaffTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTask" ADD CONSTRAINT "StaffTask_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTask" ADD CONSTRAINT "StaffTask_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPermission" ADD CONSTRAINT "StaffPermission_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
