-- CreateTable
CREATE TABLE "PrerequisiteCourse" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "nzccCourseCode" TEXT NOT NULL,
    "equivalentCourseCode" TEXT,
    "grade" TEXT,
    "institution" TEXT,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrerequisiteCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrerequisiteCourse_applicationId_idx" ON "PrerequisiteCourse"("applicationId");

-- AddForeignKey
ALTER TABLE "PrerequisiteCourse" ADD CONSTRAINT "PrerequisiteCourse_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
