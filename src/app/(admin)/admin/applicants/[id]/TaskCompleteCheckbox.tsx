"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TaskCompleteCheckbox({
  applicationId,
  taskId,
  isComplete,
}: {
  applicationId: string;
  taskId: string;
  isComplete: boolean;
}) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  async function toggle() {
    setIsToggling(true);
    await fetch(`/api/admin/applicants/${applicationId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-complete" }),
    });
    setIsToggling(false);
    router.refresh();
  }

  return (
    <input
      type="checkbox"
      checked={isComplete}
      disabled={isToggling}
      onChange={toggle}
      onClick={(e) => e.stopPropagation()}
      className="accent-green flex-shrink-0"
    />
  );
}
