"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type FlagColor = "GREEN" | "YELLOW" | "RED";

const COLOR_SWATCHES: { key: FlagColor; hex: string }[] = [
  { key: "GREEN", hex: "#22c55e" },
  { key: "YELLOW", hex: "#eab308" },
  { key: "RED", hex: "#c0392b" },
];

export function flagColorHex(color: FlagColor | null): string {
  return COLOR_SWATCHES.find((c) => c.key === color)?.hex ?? "#999999";
}

export function FlagEditor({
  applicationId,
  flagNote,
  flagColor,
  canEdit,
}: {
  applicationId: string;
  flagNote: string | null;
  flagColor: FlagColor | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState(flagNote ?? "");
  const [color, setColor] = useState<FlagColor | null>(flagColor);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagNote: text || null, flagColor: text ? color : null }),
    });
    setIsLoading(false);
    setIsOpen(false);
    router.refresh();
  }

  async function handleClear() {
    setIsLoading(true);
    await fetch(`/api/admin/applicants/${applicationId}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagNote: null, flagColor: null }),
    });
    setIsLoading(false);
    setText("");
    setColor(null);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {flagNote && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
            style={{ backgroundColor: `${flagColorHex(flagColor)}1a`, color: flagColorHex(flagColor) }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: flagColorHex(flagColor) }} />
            {flagNote}
          </span>
        )}
        {canEdit && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Edit flag"
            className="w-5 h-5 flex items-center justify-center rounded transition-colors hover:bg-black/5"
            style={{ color: "#aaa" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 4h2m-1 0v0a4 4 0 014 4v0M4 20l4.586-4.586a2 2 0 010-2.828l8-8a2 2 0 012.828 0l1.172 1.172a2 2 0 010 2.828l-8 8a2 2 0 01-2.828 0L8 15" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l4 4" />
            </svg>
          </button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Flag" size="sm">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Flag text</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Follow up, Essay outstanding…"
              className="w-full px-3 py-2.5 text-sm rounded-lg"
              style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Colour</label>
            <div className="flex gap-2.5">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setColor(c.key)}
                  aria-label={c.key}
                  className="w-8 h-8 rounded-full transition-transform"
                  style={{
                    backgroundColor: c.hex,
                    outline: color === c.key ? `2px solid ${c.hex}` : "none",
                    outlineOffset: 2,
                    transform: color === c.key ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            {flagNote && (
              <Button variant="ghost" onClick={handleClear} isLoading={isLoading}>Clear</Button>
            )}
            <Button onClick={handleSave} isLoading={isLoading} disabled={!!text && !color}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
