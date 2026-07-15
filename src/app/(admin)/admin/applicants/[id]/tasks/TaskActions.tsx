"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskStatus } from "@/generated/prisma/client";

interface StaffOption {
  id: string;
  firstName: string;
  lastName: string;
}

export function TaskActions({
  applicationId,
  taskId,
  status,
  assignedToId,
  staffOptions,
}: {
  applicationId: string;
  taskId: string;
  status: TaskStatus;
  assignedToId: string | null;
  staffOptions: StaffOption[];
}) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const isComplete = status === "APPROVED";

  async function toggleComplete() {
    setIsToggling(true);
    await fetch(`/api/admin/applicants/${applicationId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-complete" }),
    });
    setIsToggling(false);
    router.refresh();
  }

  async function handleAssign(value: string) {
    setIsAssigning(true);
    await fetch(`/api/admin/applicants/${applicationId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", assignedToId: value || null }),
    });
    setIsAssigning(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none" style={{ color: isComplete ? "#22c55e" : "#666" }}>
        <input
          type="checkbox"
          checked={isComplete}
          disabled={isToggling}
          onChange={toggleComplete}
          className="accent-green"
        />
        {isComplete ? "Complete" : "Mark complete"}
      </label>
      <select
        value={assignedToId ?? ""}
        disabled={isAssigning}
        onChange={(e) => handleAssign(e.target.value)}
        className="text-xs px-2 py-1 rounded-md"
        style={{ backgroundColor: "#F8F8F6", border: "1px solid rgba(0,0,0,0.1)", color: "#555" }}
      >
        <option value="">Unassigned</option>
        {staffOptions.map((s) => (
          <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
        ))}
      </select>
    </div>
  );
}
