"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { STAGE_LABELS } from "@/lib/stages";
import type { ApplicationStageKey } from "@/generated/prisma/client";

interface StageAdvancerProps {
  applicationId: string;
  currentStage: ApplicationStageKey;
  nextStage: ApplicationStageKey;
  staffId: string;
}

export function StageAdvancer({ applicationId, currentStage, nextStage }: StageAdvancerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdvance() {
    setIsLoading(true);
    const res = await fetch(`/api/admin/applicants/${applicationId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toStage: nextStage, notes }),
    });
    setIsLoading(false);
    if (res.ok) {
      setIsOpen(false);
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg flex-shrink-0 transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#114E3B", color: "#ffffff", boxShadow: "0 2px 8px rgba(17,78,59,0.35)" }}
      >
        Advance to {STAGE_LABELS[nextStage]}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Advance Application Stage">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            Move this application from{" "}
            <strong className="text-text">{STAGE_LABELS[currentStage]}</strong> to{" "}
            <strong className="text-text">{STAGE_LABELS[nextStage]}</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm focus:outline-none text-text placeholder:text-text-light resize-none rounded-lg"
              style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
              placeholder="Add any notes about this stage change…"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleAdvance} isLoading={isLoading}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
