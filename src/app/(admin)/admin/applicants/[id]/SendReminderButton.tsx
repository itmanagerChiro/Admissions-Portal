"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function SendReminderButton({ applicationId }: { applicationId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setMessage(null);
    const res = await fetch(`/api/admin/applicants/${applicationId}/tasks/remind`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    setIsLoading(false);

    if (res.status === 409) {
      setMessage("No incomplete tasks — nothing to remind.");
      return;
    }
    if (!res.ok) {
      setMessage("Failed to send reminder.");
      return;
    }
    if (data.sent === false) {
      setMessage("Email notifications are disabled — nothing was sent.");
      return;
    }
    setMessage(`Reminder sent (${data.taskCount} task${data.taskCount === 1 ? "" : "s"}).`);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="secondary" size="sm" onClick={handleClick} isLoading={isLoading}>
        Send Task Reminder
      </Button>
      {message && <p className="text-xs" style={{ color: "#888" }}>{message}</p>}
    </div>
  );
}
