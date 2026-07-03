"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DocumentVerifyButtons({ documentId, applicationId }: { documentId: string; applicationId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(action: "verify" | "reject") {
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="ghost" onClick={() => handleAction("reject")} isLoading={isLoading}>
        Reject
      </Button>
      <Button size="sm" onClick={() => handleAction("verify")} isLoading={isLoading}>
        Verify
      </Button>
    </div>
  );
}
