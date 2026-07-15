"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function TaskOptionsMenu({ applicationId, taskId }: { applicationId: string; taskId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsConfirming(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleDelete() {
    setIsDeleting(true);
    setError("");
    const res = await fetch(`/api/admin/applicants/${applicationId}/tasks/${taskId}`, {
      method: "DELETE",
    });
    setIsDeleting(false);
    if (res.ok) {
      router.refresh();
      setIsOpen(false);
      setIsConfirming(false);
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to delete task.");
    setIsConfirming(false);
  }

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Task options"
        className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-black/5"
        style={{ color: "#aaa" }}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-10 rounded-lg bg-white shadow-lg py-1 min-w-[160px]"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {error && <p className="px-3 py-1.5 text-xs" style={{ color: "#c0392b" }}>{error}</p>}
          {isConfirming ? (
            <div className="px-3 py-2">
              <p className="text-xs mb-2" style={{ color: "#c0392b" }}>Delete this task?</p>
              <div className="flex gap-3">
                <button onClick={handleDelete} disabled={isDeleting} className="text-xs font-semibold" style={{ color: "#c0392b" }}>
                  {isDeleting ? "Deleting…" : "Confirm"}
                </button>
                <button onClick={() => setIsConfirming(false)} className="text-xs font-semibold" style={{ color: "#999" }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirming(true)}
              className="w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-black/5"
              style={{ color: "#c0392b" }}
            >
              Delete task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
