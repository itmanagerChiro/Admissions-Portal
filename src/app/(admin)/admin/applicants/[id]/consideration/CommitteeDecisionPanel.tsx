"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

interface DecisionData {
  decision: "APPROVE" | "DECLINE" | "DEFER";
  notes: string | null;
  deferReason: string | null;
  deferUntil: string | null;
  decidedAt: string;
  decidedBy: { firstName: string; lastName: string };
}

export function CommitteeDecisionPanel({
  applicationId,
  currentStage,
  existingDecision,
  canDecide,
}: {
  applicationId: string;
  currentStage: string;
  existingDecision: DecisionData | null;
  canDecide: boolean;
}) {
  const router = useRouter();
  const [activeDecision, setActiveDecision] = useState<"APPROVE" | "DECLINE" | "DEFER" | null>(null);
  const [notes, setNotes] = useState("");
  const [deferReason, setDeferReason] = useState("");
  const [deferUntil, setDeferUntil] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canAct = canDecide && currentStage === "COMMITTEE";

  async function submit() {
    if (!activeDecision) return;
    if (activeDecision === "DEFER" && !deferReason.trim()) {
      setError("Please provide a reason for deferral.");
      return;
    }
    setIsLoading(true);
    setError("");
    const res = await fetch(`/api/admin/applicants/${applicationId}/committee-decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: activeDecision,
        notes: notes || null,
        deferReason: activeDecision === "DEFER" ? deferReason : null,
        deferUntil: activeDecision === "DEFER" && deferUntil ? deferUntil : null,
      }),
    });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to record decision.");
      return;
    }

    setActiveDecision(null);
    setNotes("");
    setDeferReason("");
    setDeferUntil("");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Committee Decision</p>
      </div>

      {existingDecision && (
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <Badge variant={existingDecision.decision === "APPROVE" ? "green" : existingDecision.decision === "DECLINE" ? "red" : "gold"}>
              {existingDecision.decision}
            </Badge>
            <span className="text-xs" style={{ color: "#aaa" }}>
              {new Date(existingDecision.decidedAt).toLocaleDateString("en-NZ")} · {existingDecision.decidedBy.firstName} {existingDecision.decidedBy.lastName}
            </span>
          </div>
          {existingDecision.decision === "DEFER" && existingDecision.deferReason && (
            <p className="text-sm" style={{ color: "#333" }}>{existingDecision.deferReason}</p>
          )}
          {existingDecision.notes && <p className="text-sm" style={{ color: "#333" }}>{existingDecision.notes}</p>}
        </div>
      )}

      {canAct ? (
        <div className="px-5 py-4 flex gap-3">
          <Button variant="primary" onClick={() => setActiveDecision("APPROVE")}>Approve</Button>
          <Button variant="danger" onClick={() => setActiveDecision("DECLINE")}>Decline</Button>
          <Button variant="ghost" onClick={() => setActiveDecision("DEFER")}>Defer</Button>
        </div>
      ) : currentStage !== "COMMITTEE" ? (
        <p className="px-5 py-4 text-xs" style={{ color: "#888" }}>
          Committee decisions can only be recorded while the application is at the Committee stage.
        </p>
      ) : null}

      <Modal isOpen={activeDecision !== null} onClose={() => setActiveDecision(null)} title={`${activeDecision ? activeDecision.charAt(0) + activeDecision.slice(1).toLowerCase() : ""} Application`}>
        <div className="flex flex-col gap-4">
          {activeDecision === "APPROVE" && (
            <p className="text-sm text-text-muted">
              Recording an approval does not automatically issue an offer. After approving, use the Offer panel on the applicant's page to issue a conditional or unconditional offer.
            </p>
          )}
          {activeDecision === "DECLINE" && (
            <p className="text-sm text-text-muted">
              This will mark the application as declined and notify the applicant by email (if enabled).
            </p>
          )}
          {activeDecision === "DEFER" && (
            <Textarea label="Reason for deferral *" rows={3} value={deferReason} onChange={(e) => setDeferReason(e.target.value)} />
          )}
          {activeDecision === "DEFER" && (
            <div>
              <label className="text-sm font-medium text-text mb-1.5 block">Revisit date (optional)</label>
              <input
                type="date" value={deferUntil} onChange={(e) => setDeferUntil(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg" style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
              />
            </div>
          )}
          <Textarea label="Committee notes (optional)" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          {error && <p className="text-sm text-red-flag">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setActiveDecision(null)}>Cancel</Button>
            <Button onClick={submit} isLoading={isLoading}>Confirm {activeDecision}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
