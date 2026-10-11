"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface InterviewReviewData {
  score: number | null;
  notes: string | null;
  interviewDate: string | null;
  format: "ONLINE" | "IN_PERSON" | null;
}

export function InterviewReviewPanel({ applicationId, review, canEdit }: { applicationId: string; review: InterviewReviewData | null; canEdit: boolean }) {
  const router = useRouter();
  const [score, setScore] = useState(review?.score?.toString() ?? "");
  const [notes, setNotes] = useState(review?.notes ?? "");
  const [interviewDate, setInterviewDate] = useState(review?.interviewDate?.slice(0, 10) ?? "");
  const [format, setFormat] = useState(review?.format ?? "");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/interview-review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score: score ? parseInt(score, 10) : null,
        notes: notes || null,
        interviewDate: interviewDate || null,
        format: format || null,
      }),
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Interview Review</p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Score (out of 30)</label>
            <input
              type="number" min={1} max={30} value={score} onChange={(e) => setScore(e.target.value)} disabled={!canEdit}
              className="w-full px-3 py-2 text-sm rounded-lg" style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
            />
          </div>
          <Select label="Format" value={format} onChange={(e) => setFormat(e.target.value as "ONLINE" | "IN_PERSON" | "")} disabled={!canEdit}>
            <option value="">Not set</option>
            <option value="ONLINE">Online</option>
            <option value="IN_PERSON">In person</option>
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-text mb-1 block">Interview date</label>
          <input
            type="date" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} disabled={!canEdit}
            className="w-full px-3 py-2 text-sm rounded-lg" style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
          />
        </div>
        <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!canEdit} />
        {canEdit && (
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave} isLoading={isLoading}>Save</Button>
          </div>
        )}
      </div>
    </div>
  );
}
