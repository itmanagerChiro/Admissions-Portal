"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface IntakeYear {
  id: string;
  year: number;
  label: string;
  isActive: boolean;
}

export function IntakeYearForm({ intakeYears }: { intakeYears: IntakeYear[] }) {
  const router = useRouter();
  const [year, setYear] = useState("");
  const [label, setLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await fetch("/api/admin/intake-years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: parseInt(year), label: label || `${year} INTAKE` }),
    });
    setIsLoading(false);
    setYear("");
    setLabel("");
    router.refresh();
  }

  async function setActive(id: string) {
    await fetch(`/api/admin/intake-years/${id}/activate`, { method: "POST" });
    router.refresh();
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        {intakeYears.map((iy, i) => (
          <div
            key={iy.id}
            className="flex items-center gap-3 px-5 py-3.5"
            style={{ borderBottom: i < intakeYears.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
          >
            <span className="text-sm font-semibold flex-1" style={{ color: "#222" }}>{iy.label}</span>
            {iy.isActive && <Badge variant="green">Active</Badge>}
            {!iy.isActive && (
              <button onClick={() => setActive(iy.id)} className="text-xs font-semibold transition-colors" style={{ color: "#114E3B" }}>
                Set active
              </button>
            )}
          </div>
        ))}
        {intakeYears.length === 0 && (
          <div className="px-5 py-4 text-sm" style={{ color: "#aaa" }}>No intake years yet.</div>
        )}
      </div>

      <form onSubmit={handleCreate} className="flex items-end gap-3">
        <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2027" required />
        <Input label="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="2027 INTAKE" />
        <Button type="submit" isLoading={isLoading} size="sm">Create</Button>
      </form>
    </div>
  );
}
