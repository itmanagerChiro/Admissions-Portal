import type { ApplicationStageKey } from "@/generated/prisma/client";

export const STAGE_LABELS: Record<ApplicationStageKey, string> = {
  NEW_SUBMITTED: "Application Submitted",
  INTAKE_REVIEW: "Application Review",
  ACADEMIC_CHECK: "Academic Check",
  INTERVIEW: "Interview",
  ESSAY: "Essay",
  COMMITTEE: "Committee",
  OFFER_CONDITIONAL: "Offer - Conditional",
  OFFER_UNCONDITIONAL: "Offer - Unconditional",
  ACCEPTED: "Enrolment Accepted",
  ENROLLED: "Enrolled",
};

// Same as STAGE_LABELS, except OFFER_CONDITIONAL and OFFER_UNCONDITIONAL are combined
// into a single "Offer" label. Use this for status displays (timeline, applicant list/detail);
// use STAGE_LABELS where the two offer types must remain visually distinct (e.g. the pipeline board).
export const STAGE_STATUS_LABELS: Record<ApplicationStageKey, string> = {
  ...STAGE_LABELS,
  OFFER_CONDITIONAL: "Offer",
  OFFER_UNCONDITIONAL: "Offer",
};

export const STAGE_ORDER: ApplicationStageKey[] = [
  "NEW_SUBMITTED",
  "INTAKE_REVIEW",
  "ACADEMIC_CHECK",
  "INTERVIEW",
  "ESSAY",
  "COMMITTEE",
  "OFFER_CONDITIONAL",
  "OFFER_UNCONDITIONAL",
  "ACCEPTED",
  "ENROLLED",
];

// Collapsed step sequence for progress-bar style UI, where OFFER_CONDITIONAL and
// OFFER_UNCONDITIONAL are shown as a single "Offer" step.
export const STAGE_DISPLAY_STEPS: { key: string; label: string; stages: ApplicationStageKey[] }[] = [
  { key: "NEW_SUBMITTED", label: STAGE_LABELS.NEW_SUBMITTED, stages: ["NEW_SUBMITTED"] },
  { key: "INTAKE_REVIEW", label: STAGE_LABELS.INTAKE_REVIEW, stages: ["INTAKE_REVIEW"] },
  { key: "ACADEMIC_CHECK", label: STAGE_LABELS.ACADEMIC_CHECK, stages: ["ACADEMIC_CHECK"] },
  { key: "INTERVIEW", label: STAGE_LABELS.INTERVIEW, stages: ["INTERVIEW"] },
  { key: "ESSAY", label: STAGE_LABELS.ESSAY, stages: ["ESSAY"] },
  { key: "COMMITTEE", label: STAGE_LABELS.COMMITTEE, stages: ["COMMITTEE"] },
  { key: "OFFER", label: "Offer", stages: ["OFFER_CONDITIONAL", "OFFER_UNCONDITIONAL"] },
  { key: "ACCEPTED", label: STAGE_LABELS.ACCEPTED, stages: ["ACCEPTED"] },
  { key: "ENROLLED", label: STAGE_LABELS.ENROLLED, stages: ["ENROLLED"] },
];

export function stageDisplayIndex(stage: ApplicationStageKey): number {
  return STAGE_DISPLAY_STEPS.findIndex((s) => s.stages.includes(stage));
}
