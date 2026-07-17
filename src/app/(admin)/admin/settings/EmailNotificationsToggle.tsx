"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EmailNotificationsToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isLoading, setIsLoading] = useState(false);

  async function toggle() {
    const next = !isEnabled;
    setIsLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailNotificationsEnabled: next }),
    });
    setIsLoading(false);
    if (res.ok) {
      setIsEnabled(next);
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold" style={{ color: "#222" }}>Enable Email Notifications</p>
        <p className="text-xs mt-0.5" style={{ color: "#888" }}>
          Sends students stage-change, task-assignment, and reminder emails, and notifies staff when a student completes all required tasks.
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={isLoading}
        aria-pressed={isEnabled}
        aria-label="Enable email notifications"
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60"
        style={{ backgroundColor: isEnabled ? "#114E3B" : "rgba(0,0,0,0.15)" }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
          style={{ transform: isEnabled ? "translateX(20px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}
