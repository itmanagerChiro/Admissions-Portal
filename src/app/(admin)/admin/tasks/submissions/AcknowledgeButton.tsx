"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AcknowledgeButton({ applicationId, taskId }: { applicationId: string; taskId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleAcknowledge() {
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "acknowledge" }),
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleAcknowledge}
      disabled={isLoading}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
      style={{ backgroundColor: "rgba(199,154,59,0.15)", color: "#C79A3B" }}
    >
      Mark as seen
    </button>
  );
}
