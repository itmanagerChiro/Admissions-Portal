"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DeleteAccountPanel({
  studentUserId,
  studentName,
  deletionRequestedAt,
  canDelete,
}: {
  studentUserId: string;
  studentName: string;
  deletionRequestedAt: string | null;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!canDelete && !deletionRequestedAt) return null;

  async function handleDelete() {
    setIsLoading(true);
    setError("");
    const res = await fetch(`/api/admin/students/${studentUserId}/delete`, { method: "POST" });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to delete account.");
      return;
    }

    router.push("/admin/applicants");
    router.refresh();
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden"
      style={deletionRequestedAt ? { border: "1px solid rgba(192,57,43,0.3)" } : { border: "1px solid rgba(0,0,0,0.06)" }}
    >
      {deletionRequestedAt ? (
        <>
          <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(192,57,43,0.15)", backgroundColor: "rgba(192,57,43,0.05)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#c0392b" }}>Deletion Requested</p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <p className="text-sm" style={{ color: "#333" }}>
              The student requested account deletion on {new Date(deletionRequestedAt).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}.
              They can no longer sign in.
            </p>
            {canDelete && (
              <Button variant="danger" onClick={() => setIsOpen(true)} className="flex-shrink-0">Delete Account</Button>
            )}
          </div>
        </>
      ) : (
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#555" }}>Account</p>
            <p className="text-xs" style={{ color: "#888" }}>Permanently remove this student's account and application.</p>
          </div>
          <Button variant="danger" onClick={() => setIsOpen(true)} className="flex-shrink-0">Delete Account</Button>
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Student Account" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            This will permanently delete <strong>{studentName}</strong>'s account and application, including all
            documents, tasks, offers, messages, and history. This cannot be undone.
          </p>
          {!deletionRequestedAt && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#8a6416", backgroundColor: "rgba(199,154,59,0.1)" }}>
              This student has not requested deletion themselves. Confirm you have a valid reason to remove this account before proceeding.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Type DELETE to confirm</label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg"
              style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
            />
          </div>
          {error && <p className="text-sm text-red-flag">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading} disabled={confirmText !== "DELETE"}>
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
