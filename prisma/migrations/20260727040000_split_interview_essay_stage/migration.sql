BEGIN;
CREATE TYPE "ApplicationStageKey_new" AS ENUM ('NEW_SUBMITTED', 'INTAKE_REVIEW', 'ACADEMIC_CHECK', 'INTERVIEW', 'ESSAY', 'COMMITTEE', 'OFFER_CONDITIONAL', 'OFFER_UNCONDITIONAL', 'ACCEPTED', 'ENROLLED');
ALTER TABLE "public"."Application" ALTER COLUMN "currentStage" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "currentStage" TYPE "ApplicationStageKey_new" USING (
  CASE WHEN "currentStage"::text = 'INTERVIEW_AND_ESSAY' THEN 'INTERVIEW' ELSE "currentStage"::text END::"ApplicationStageKey_new"
);
ALTER TABLE "ApplicationStageHistory" ALTER COLUMN "fromStage" TYPE "ApplicationStageKey_new" USING (
  CASE WHEN "fromStage"::text = 'INTERVIEW_AND_ESSAY' THEN 'INTERVIEW' ELSE "fromStage"::text END::"ApplicationStageKey_new"
);
ALTER TABLE "ApplicationStageHistory" ALTER COLUMN "toStage" TYPE "ApplicationStageKey_new" USING (
  CASE WHEN "toStage"::text = 'INTERVIEW_AND_ESSAY' THEN 'INTERVIEW' ELSE "toStage"::text END::"ApplicationStageKey_new"
);
ALTER TABLE "TaskTemplate" ALTER COLUMN "stageKey" TYPE "ApplicationStageKey_new" USING (
  CASE WHEN "stageKey"::text = 'INTERVIEW_AND_ESSAY' THEN 'INTERVIEW' ELSE "stageKey"::text END::"ApplicationStageKey_new"
);
ALTER TABLE "Task" ALTER COLUMN "stageKey" TYPE "ApplicationStageKey_new" USING (
  CASE WHEN "stageKey"::text = 'INTERVIEW_AND_ESSAY' THEN 'INTERVIEW' ELSE "stageKey"::text END::"ApplicationStageKey_new"
);
ALTER TABLE "TimelineEvent" ALTER COLUMN "relatedStageKey" TYPE "ApplicationStageKey_new" USING (
  CASE WHEN "relatedStageKey"::text = 'INTERVIEW_AND_ESSAY' THEN 'INTERVIEW' ELSE "relatedStageKey"::text END::"ApplicationStageKey_new"
);
ALTER TYPE "ApplicationStageKey" RENAME TO "ApplicationStageKey_old";
ALTER TYPE "ApplicationStageKey_new" RENAME TO "ApplicationStageKey";
DROP TYPE "public"."ApplicationStageKey_old";
ALTER TABLE "Application" ALTER COLUMN "currentStage" SET DEFAULT 'NEW_SUBMITTED';
COMMIT;
