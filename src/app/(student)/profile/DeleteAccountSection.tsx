"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DeleteAccountSection({ deletionRequested }: { deletionRequested: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest() {
    setIsLoading(true);
    setError("");
    const res = await fetch("/api/student/request-deletion", { method: "POST" });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to submit request.");
      return;
    }

    await signOut({ callbackUrl: "/login?deletionRequested=1" });
  }

  if (deletionRequested) {
    return (
      <section className="bg-white p-6 rounded-2xl" style={{ border: "1px solid rgba(192,57,43,0.2)" }}>
        <h2 className="font-serif text-base text-text mb-2">Account Deletion</h2>
        <p className="text-sm" style={{ color: "#c0392b" }}>
          Deletion of this account has been requested and is pending review by NZCC staff. You will no longer be
          able to sign in. Contact <a href="mailto:Support@nzcc.ac.nz" style={{ color: "#c0392b", fontWeight: 600 }}>Support@nzcc.ac.nz</a> with any questions.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-2xl" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
      <h2 className="font-serif text-base text-text mb-2">Account Deletion</h2>
      <p className="text-sm text-text-muted mb-4">
        Requesting deletion will notify NZCC staff, who will review and action the removal of your account and
        application data in line with the Privacy Act 2020. You will not be able to sign in once a request has
        been submitted.
      </p>
      <Button variant="danger" onClick={() => setIsOpen(true)}>Request Account Deletion</Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Request Account Deletion" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            This will immediately prevent you from signing in and notify NZCC staff to review and delete your
            account. This cannot be undone by you once submitted.
          </p>
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
            <Button
              variant="danger"
              onClick={handleRequest}
              isLoading={isLoading}
              disabled={confirmText !== "DELETE"}
            >
              Request Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
