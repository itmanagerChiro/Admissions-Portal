"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface Document {
  id: string;
  filename: string;
  storageKey: string;
  status: string;
}

interface TaskReviewPanelProps {
  taskId: string;
  applicationId: string;
  studentNote: string | null;
  documents: Document[];
}

export function TaskReviewPanel({ taskId, applicationId, studentNote, documents }: TaskReviewPanelProps) {
  const router = useRouter();
  const [reviewNote, setReviewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    if (action === "reject" && !reviewNote.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNote }),
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-3 rounded-lg p-4" style={{ backgroundColor: "rgba(199,154,59,0.06)", borderLeft: "3px solid #C79A3B" }}>
      <p className="text-xs font-semibold text-text mb-3">Review Submission</p>

      {studentNote && (
        <div className="mb-3">
          <p className="text-xs font-medium text-text-muted mb-1">Student note:</p>
          <p className="text-xs text-text bg-white rounded-lg px-3 py-2" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>{studentNote}</p>
        </div>
      )}

      {documents.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-text-muted mb-1">Submitted documents:</p>
          <ul className="flex flex-col gap-1">
            {documents.map((doc) => (
              <li key={doc.id}>
                <a href={`/api/files/${doc.storageKey}`} className="text-xs font-semibold hover:underline" style={{ color: "#114E3B" }} target="_blank" rel="noreferrer">
                  {doc.filename} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-xs font-semibold text-text mb-1">Review note (required for rejection)</label>
        <textarea
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-xs focus:outline-none text-text placeholder:text-text-light resize-none rounded-lg"
          style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
          placeholder="Add a note for the student…"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => handleAction("reject")} isLoading={isLoading}>
          Reject
        </Button>
        <Button size="sm" onClick={() => handleAction("approve")} isLoading={isLoading}>
          Approve
        </Button>
      </div>
    </div>
  );
}
