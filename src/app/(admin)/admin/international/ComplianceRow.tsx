"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { STAGE_STATUS_LABELS } from "@/lib/stages";
import Link from "next/link";

const STAGE_BADGE: Record<string, "olive" | "gold" | "blue" | "green" | "muted" | "purple"> = {
  NEW_SUBMITTED: "muted",
  INTAKE_REVIEW: "blue",
  ACADEMIC_CHECK: "purple",
  INTERVIEW: "gold",
  ESSAY: "gold",
  COMMITTEE: "gold",
  OFFER_CONDITIONAL: "green",
  OFFER_UNCONDITIONAL: "green",
  ACCEPTED: "green",
  ENROLLED: "olive",
};

const STATUS_DOT: Record<string, string> = {
  NOT_YET: "rgba(0,0,0,0.12)",
  APPLIED: "#C79A3B",
  RECEIVED: "#22c55e",
  IN_PROGRESS: "#C79A3B",
  CONFIRMED: "#22c55e",
  REQUIRED: "#c0392b",
  WAIVED: "#22c55e",
};

const STATUS_LABEL: Record<string, string> = {
  NOT_YET: "Not yet",
  APPLIED: "Applied",
  RECEIVED: "Received",
  IN_PROGRESS: "In progress",
  CONFIRMED: "Confirmed",
  REQUIRED: "Required",
  WAIVED: "Waived",
};

function StatusCell({ value, options, field, applicationId, canEdit }: {
  value: string | null;
  options: string[];
  field: string;
  applicationId: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleChange(newValue: string) {
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/international`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: newValue }),
    });
    setIsLoading(false);
    router.refresh();
  }

  const v = value ?? "NOT_YET";
  const dotColor = STATUS_DOT[v] ?? "rgba(0,0,0,0.12)";

  return (
    <td className="px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
        {canEdit ? (
          <select
            value={v}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isLoading}
            className="text-xs bg-transparent outline-none cursor-pointer"
            style={{ color: "#555" }}
          >
            {options.map((o) => (
              <option key={o} value={o}>{STATUS_LABEL[o] ?? o}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs" style={{ color: "#555" }}>{STATUS_LABEL[v] ?? v}</span>
        )}
      </div>
    </td>
  );
}

export function ComplianceRow({ application, canEdit, isLast }: {
  application: {
    id: string;
    applicantNumber: string;
    currentStage: string;
    student: { firstName: string; lastName: string };
    internationalCompliance: {
      visaStatus: string | null;
      healthInsuranceStatus: string | null;
      ieltsStatus: string | null;
      offerOfPlaceIssued: boolean;
    } | null;
  };
  canEdit: boolean;
  isLast?: boolean;
}) {
  const router = useRouter();
  const comp = application.internationalCompliance;

  async function toggleOffer() {
    await fetch(`/api/admin/applicants/${application.id}/international`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerOfPlaceIssued: !comp?.offerOfPlaceIssued }),
    });
    router.refresh();
  }

  return (
    <tr
      className="compliance-row transition-colors"
      style={{ borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)" }}
    >
      <td className="px-5 py-4 compliance-accent-cell" style={{ borderLeft: "3px solid transparent", transition: "border-color 0.15s" }}>
        <Link href={`/admin/applicants/${application.id}`}>
          <span className="text-sm font-semibold block" style={{ color: "#222" }}>
            {application.student.firstName} {application.student.lastName}
          </span>
          <span className="text-xs font-mono" style={{ color: "#aaa" }}>{application.applicantNumber}</span>
        </Link>
      </td>
      <td className="px-5 py-4">
        <Badge variant={STAGE_BADGE[application.currentStage] ?? "muted"}>
          {STAGE_STATUS_LABELS[application.currentStage as keyof typeof STAGE_STATUS_LABELS] ?? application.currentStage}
        </Badge>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: comp?.offerOfPlaceIssued ? "#22c55e" : "rgba(0,0,0,0.12)" }} />
          {canEdit ? (
            <button onClick={toggleOffer} className="text-xs transition-colors" style={{ color: "#555" }}>
              {comp?.offerOfPlaceIssued ? "Issued" : "Not issued"}
            </button>
          ) : (
            <span className="text-xs" style={{ color: "#555" }}>{comp?.offerOfPlaceIssued ? "Issued" : "Not issued"}</span>
          )}
        </div>
      </td>
      <StatusCell
        value={comp?.visaStatus ?? "NOT_YET"}
        options={["NOT_YET", "APPLIED", "RECEIVED"]}
        field="visaStatus"
        applicationId={application.id}
        canEdit={canEdit}
      />
      <StatusCell
        value={comp?.healthInsuranceStatus ?? "NOT_YET"}
        options={["NOT_YET", "CONFIRMED"]}
        field="healthInsuranceStatus"
        applicationId={application.id}
        canEdit={canEdit}
      />
      <StatusCell
        value={comp?.ieltsStatus ?? "NOT_YET"}
        options={["NOT_YET", "IN_PROGRESS", "CONFIRMED", "WAIVED", "REQUIRED"]}
        field="ieltsStatus"
        applicationId={application.id}
        canEdit={canEdit}
      />
    </tr>
  );
}
