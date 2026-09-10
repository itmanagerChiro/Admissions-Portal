"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface IntakeYear {
  id: string;
  year: number;
  label: string;
  isActive: boolean;
  isVisible: boolean;
  isOpenForApplications: boolean;
  isArchived: boolean;
}

function ToggleSwitch({ checked, onChange, disabled, label }: { checked: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      title={label}
      className="relative inline-flex items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ width: 34, height: 19, backgroundColor: checked ? "#114E3B" : "rgba(0,0,0,0.15)" }}
    >
      <span
        className="inline-block rounded-full bg-white transition-transform"
        style={{ width: 15, height: 15, transform: `translateX(${checked ? 17 : 2}px)` }}
      />
    </button>
  );
}

function IntakeRow({ iy, onChanged }: { iy: IntakeYear; onChanged: () => void }) {
  const router = useRouter();
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState(iy.label);
  const [confirmAction, setConfirmAction] = useState<"archive" | "unarchive" | "delete" | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function patch(body: Record<string, unknown>) {
    setIsLoading(true);
    await fetch(`/api/admin/intake-years/${iy.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setIsLoading(false);
    onChanged();
  }

  async function saveLabel() {
    if (labelDraft.trim() && labelDraft !== iy.label) await patch({ label: labelDraft.trim() });
    setIsEditingLabel(false);
  }

  async function setActive() {
    await fetch(`/api/admin/intake-years/${iy.id}/activate`, { method: "POST" });
    onChanged();
  }

  async function confirmArchiveToggle() {
    await patch({ isArchived: confirmAction === "archive" });
    setConfirmAction(null);
  }

  async function confirmDelete() {
    setIsLoading(true);
    setDeleteError("");
    const res = await fetch(`/api/admin/intake-years/${iy.id}`, { method: "DELETE" });
    setIsLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteError(data.error ?? "Failed to delete.");
      return;
    }
    setConfirmAction(null);
    router.refresh();
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5"
      style={{ opacity: iy.isArchived ? 0.6 : 1 }}
    >
      <div className="flex-1 min-w-0">
        {isEditingLabel ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveLabel()}
              className="text-sm font-semibold px-2 py-1 rounded"
              style={{ border: "1.5px solid rgba(0,0,0,0.15)", color: "#222" }}
            />
            <button onClick={saveLabel} className="text-xs font-semibold" style={{ color: "#114E3B" }}>Save</button>
            <button onClick={() => { setIsEditingLabel(false); setLabelDraft(iy.label); }} className="text-xs" style={{ color: "#999" }}>Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "#222" }}>{iy.label}</span>
            {!iy.isArchived && (
              <button onClick={() => setIsEditingLabel(true)} className="text-xs" style={{ color: "#aaa" }}>Rename</button>
            )}
          </div>
        )}
        {iy.isArchived && <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#999" }}>Archived · Read-only</span>}
      </div>

      {iy.isActive && <Badge variant="green">Active</Badge>}
      {!iy.isActive && !iy.isArchived && (
        <button onClick={setActive} className="text-xs font-semibold transition-colors" style={{ color: "#114E3B" }}>
          Set active
        </button>
      )}

      <div className="flex items-center gap-1.5" title="Show in intake selection dropdown">
        <span className="text-[10px] uppercase tracking-wide" style={{ color: "#999" }}>In dropdown</span>
        <ToggleSwitch
          checked={iy.isVisible}
          onChange={() => patch({ isVisible: !iy.isVisible })}
          disabled={iy.isArchived || isLoading}
          label="Show in intake selection dropdown"
        />
      </div>

      <div className="flex items-center gap-1.5" title="Open for student applications">
        <span className="text-[10px] uppercase tracking-wide" style={{ color: "#999" }}>Student portal</span>
        <ToggleSwitch
          checked={iy.isOpenForApplications}
          onChange={() => patch({ isOpenForApplications: !iy.isOpenForApplications })}
          disabled={iy.isArchived || isLoading}
          label="Open for student applications"
        />
      </div>

      {iy.isArchived ? (
        <button onClick={() => setConfirmAction("unarchive")} className="text-xs font-semibold" style={{ color: "#114E3B" }}>Unarchive</button>
      ) : (
        <button onClick={() => setConfirmAction("archive")} className="text-xs font-semibold" style={{ color: "#8a6416" }}>Archive</button>
      )}

      <button onClick={() => setConfirmAction("delete")} className="text-xs font-semibold" style={{ color: "#c0392b" }}>Delete</button>

      <Modal
        isOpen={confirmAction === "archive" || confirmAction === "unarchive"}
        onClose={() => setConfirmAction(null)}
        title={confirmAction === "archive" ? "Archive Intake Year" : "Unarchive Intake Year"}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            {confirmAction === "archive" ? (
              <>Archiving <strong className="text-text">{iy.label}</strong> will make it read-only, and remove it from the intake selection dropdown and the student enrolment portal. Applications and data will be preserved. You can unarchive it later if needed.</>
            ) : (
              <>Unarchiving <strong className="text-text">{iy.label}</strong> will make it editable again. It will not automatically reappear in the dropdown or student portal — you'll need to turn those back on separately.</>
            )}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button onClick={confirmArchiveToggle} isLoading={isLoading}>
              {confirmAction === "archive" ? "Archive" : "Unarchive"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={confirmAction === "delete"} onClose={() => setConfirmAction(null)} title="Delete Intake Year">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">
            Permanently delete <strong className="text-text">{iy.label}</strong>? This cannot be undone. If any
            applications reference this intake year, deletion will be blocked — archive it instead to preserve data.
          </p>
          {deleteError && <p className="text-sm text-red-flag">{deleteError}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button onClick={confirmDelete} isLoading={isLoading}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
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

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
        {intakeYears.map((iy) => (
          <IntakeRow key={iy.id} iy={iy} onChanged={() => router.refresh()} />
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
