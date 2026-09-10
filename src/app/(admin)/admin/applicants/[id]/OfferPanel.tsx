"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

const STANDARD_CONDITIONS = [
  "Successful completion of NCEA Level 3 (or equivalent) with required credits",
  "Certified copies of academic transcripts provided",
  "Satisfactory police vetting check",
];

interface OfferConditionData {
  id: string;
  conditionText: string;
  isStandard: boolean;
  status: "PENDING" | "SATISFIED" | "WAIVED";
}

interface OfferData {
  id: string;
  type: "CONDITIONAL" | "UNCONDITIONAL";
  responseStatus: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  acceptanceDeadline: string | null;
  issuedAt: string;
  conditions: OfferConditionData[];
}

interface OfferPanelProps {
  applicationId: string;
  offers: OfferData[];
  canManage: boolean;
  depositStatus?: "NOT_PAID" | "PENDING_REVIEW" | "PAID";
  depositMethod?: string | null;
}

const DEPOSIT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Credit Card",
};

export function OfferPanel({ applicationId, offers, canManage, depositStatus, depositMethod }: OfferPanelProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [type, setType] = useState<"CONDITIONAL" | "UNCONDITIONAL">("CONDITIONAL");
  const [deadline, setDeadline] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<Set<string>>(new Set());
  const [customConditions, setCustomConditions] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApprovingDeposit, setIsApprovingDeposit] = useState(false);
  const [error, setError] = useState("");

  async function handleApproveDeposit() {
    setIsApprovingDeposit(true);
    setError("");
    const res = await fetch(`/api/admin/applicants/${applicationId}/approve-deposit`, { method: "POST" });
    setIsApprovingDeposit(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to approve deposit.");
      return;
    }
    router.refresh();
  }

  function toggleStandard(text: string) {
    setSelectedStandard((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  async function handleCreate() {
    setError("");
    const conditions = [
      ...Array.from(selectedStandard).map((conditionText) => ({ conditionText, isStandard: true })),
      ...customConditions.filter((c) => c.trim()).map((conditionText) => ({ conditionText, isStandard: false })),
    ];

    if (type === "CONDITIONAL" && conditions.length === 0) {
      setError("Add at least one condition for a conditional offer.");
      return;
    }

    setIsLoading(true);
    const res = await fetch(`/api/admin/applicants/${applicationId}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        acceptanceDeadline: deadline || null,
        conditions,
      }),
    });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create offer.");
      return;
    }

    setIsCreateOpen(false);
    setSelectedStandard(new Set());
    setCustomConditions([""]);
    setDeadline("");
    router.refresh();
  }

  async function setConditionStatus(offerId: string, conditionId: string, status: "SATISFIED" | "WAIVED" | "PENDING") {
    await fetch(`/api/admin/applicants/${applicationId}/offers/${offerId}/conditions/${conditionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  const activeOffer = offers.find((o) => o.responseStatus === "PENDING") ?? offers[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Offer</p>
        {canManage && (
          <button onClick={() => setIsCreateOpen(true)} className="text-xs font-semibold" style={{ color: "#114E3B" }}>
            + New Offer
          </button>
        )}
      </div>

      {!activeOffer ? (
        <p className="px-5 py-4 text-xs" style={{ color: "#888" }}>No offer issued yet.</p>
      ) : (
        <div className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: "#222" }}>
              {activeOffer.type === "CONDITIONAL" ? "Conditional Offer" : "Unconditional Offer"}
            </span>
            <Badge
              variant={
                activeOffer.responseStatus === "ACCEPTED"
                  ? "green"
                  : activeOffer.responseStatus === "DECLINED"
                  ? "red"
                  : activeOffer.responseStatus === "EXPIRED"
                  ? "muted"
                  : "gold"
              }
            >
              {activeOffer.responseStatus}
            </Badge>
          </div>
          {activeOffer.acceptanceDeadline && (
            <p className="text-xs" style={{ color: "#888" }}>
              Deadline: {new Date(activeOffer.acceptanceDeadline).toLocaleDateString("en-NZ")}
            </p>
          )}

          {activeOffer.conditions.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {activeOffer.conditions.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate" style={{ color: "#333" }}>{c.conditionText}</span>
                  {canManage && c.status === "PENDING" ? (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setConditionStatus(activeOffer.id, c.id, "SATISFIED")} className="text-[10px] font-semibold uppercase" style={{ color: "#114E3B" }}>
                        Satisfy
                      </button>
                      <button onClick={() => setConditionStatus(activeOffer.id, c.id, "WAIVED")} className="text-[10px] font-semibold uppercase" style={{ color: "#888" }}>
                        Waive
                      </button>
                    </div>
                  ) : (
                    <Badge variant={c.status === "SATISFIED" ? "green" : c.status === "WAIVED" ? "muted" : "gold"} className="flex-shrink-0">
                      {c.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {(activeOffer.responseStatus === "ACCEPTED" || depositStatus === "PENDING_REVIEW") && (
            <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <span className="text-xs" style={{ color: "#888" }}>Enrolment deposit</span>
              <div className="flex items-center gap-2">
                <Badge variant={depositStatus === "PAID" ? "green" : depositStatus === "PENDING_REVIEW" ? "gold" : "muted"}>
                  {depositStatus === "PAID"
                    ? `Paid · ${DEPOSIT_METHOD_LABELS[depositMethod ?? ""] ?? depositMethod}`
                    : depositStatus === "PENDING_REVIEW"
                    ? "Bank transfer — pending review"
                    : "Not paid"}
                </Badge>
                {canManage && depositStatus === "PENDING_REVIEW" && (
                  <Button size="sm" onClick={handleApproveDeposit} isLoading={isApprovingDeposit}>
                    Approve Transfer
                  </Button>
                )}
              </div>
            </div>
          )}
          {error && <p className="text-xs text-red-flag">{error}</p>}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Issue Offer" size="lg">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <button
              onClick={() => setType("CONDITIONAL")}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg"
              style={{ backgroundColor: type === "CONDITIONAL" ? "#114E3B" : "#F8F8F6", color: type === "CONDITIONAL" ? "#fff" : "#555" }}
            >
              Conditional
            </button>
            <button
              onClick={() => setType("UNCONDITIONAL")}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg"
              style={{ backgroundColor: type === "UNCONDITIONAL" ? "#114E3B" : "#F8F8F6", color: type === "UNCONDITIONAL" ? "#fff" : "#555" }}
            >
              Unconditional
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Acceptance deadline (optional)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg"
              style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
            />
          </div>

          {type === "CONDITIONAL" && (
            <>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Standard conditions</label>
                <div className="flex flex-col gap-1.5">
                  {STANDARD_CONDITIONS.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm" style={{ color: "#333" }}>
                      <input type="checkbox" checked={selectedStandard.has(c)} onChange={() => toggleStandard(c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Custom conditions</label>
                {customConditions.map((val, i) => (
                  <input
                    key={i}
                    value={val}
                    onChange={(e) => {
                      const next = [...customConditions];
                      next[i] = e.target.value;
                      setCustomConditions(next);
                    }}
                    placeholder="Enter condition text…"
                    className="w-full px-3 py-2.5 text-sm rounded-lg mb-2"
                    style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
                  />
                ))}
                <button
                  onClick={() => setCustomConditions([...customConditions, ""])}
                  className="text-xs font-semibold"
                  style={{ color: "#114E3B" }}
                >
                  + Add another condition
                </button>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-flag">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={isLoading}>Issue Offer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
