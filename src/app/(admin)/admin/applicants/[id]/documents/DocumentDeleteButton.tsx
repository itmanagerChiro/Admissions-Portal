"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DocumentDeleteButton({ documentId, applicationId, filename }: { documentId: string; applicationId: string; filename: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/documents/${documentId}`, { method: "DELETE" });
    setIsLoading(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="text-xs font-semibold transition-colors" style={{ color: "#c0392b" }}>
        Delete
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Document" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to delete <strong>{filename}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
