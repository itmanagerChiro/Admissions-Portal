import type { ApplicationStageKey } from "@/generated/prisma/client";

export const STAGE_LABELS: Record<ApplicationStageKey, string> = {
  NEW_SUBMITTED: "New / Submitted",
  INTAKE_REVIEW: "Intake Review",
  ACADEMIC_CHECK: "Academic Check",
  INTERVIEW_AND_ESSAY: "Interview & Essay",
  COMMITTEE: "Committee",
  OFFERED: "Offered",
  ENROLLED: "Enrolled",
};

export const STAGE_ORDER: ApplicationStageKey[] = [
  "NEW_SUBMITTED",
  "INTAKE_REVIEW",
  "ACADEMIC_CHECK",
  "INTERVIEW_AND_ESSAY",
  "COMMITTEE",
  "OFFERED",
  "ENROLLED",
];
