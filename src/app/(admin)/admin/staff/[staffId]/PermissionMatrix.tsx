"use client";

import { useState } from "react";
import { PermissionKey } from "@/generated/prisma/client";
import { Button } from "@/components/ui/Button";

interface Group {
  label: string;
  keys: PermissionKey[];
}

export function PermissionMatrix({
  staffId,
  groups,
  labels,
  initialPermissions,
}: {
  staffId: string;
  groups: Group[];
  labels: Record<string, string>;
  initialPermissions: Record<PermissionKey, boolean>;
}) {
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>(initialPermissions);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(key: PermissionKey) {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  async function handleSave() {
    setIsLoading(true);
    const permissionsList = Object.entries(permissions).map(([key, granted]) => ({
      key: key as PermissionKey,
      granted,
    }));
    await fetch(`/api/admin/staff/${staffId}/permissions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: permissionsList }),
    });
    setIsLoading(false);
    setSaved(true);
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {groups.map((group, gi) => (
          <div key={group.label}>
            <div className="px-5 py-2.5" style={{ backgroundColor: "#F8F8F6", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#999" }}>{group.label}</p>
            </div>
            {group.keys.map((key, ki) => {
              const isLastInGroup = ki === group.keys.length - 1;
              const isLastGroup = gi === groups.length - 1;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: !isLastInGroup || !isLastGroup ? "1px solid rgba(0,0,0,0.05)" : "none" }}
                >
                  <span className="text-sm" style={{ color: "#333" }}>{labels[key]}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={permissions[key]}
                    onClick={() => toggle(key)}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200"
                    style={{ backgroundColor: permissions[key] ? "#114E3B" : "rgba(0,0,0,0.15)" }}
                  >
                    <span
                      className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200"
                      style={{ transform: permissions[key] ? "translateX(20px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button onClick={handleSave} isLoading={isLoading}>Save Permissions</Button>
        {saved && <span className="text-xs font-semibold" style={{ color: "#114E3B" }}>Saved ✓</span>}
      </div>
    </div>
  );
}