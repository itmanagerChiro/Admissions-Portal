"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

interface ApplicantCard {
  id: string;
  applicantNumber: string;
  currentStage: string;
  category: string;
  yearLevel: string;
  flagNote: string | null;
  updatedAt: Date;
  student: { firstName: string; lastName: string };
}

interface Column {
  stage: string;
  label: string;
  applications: ApplicantCard[];
}

const CATEGORY_VARIANT: Record<string, "olive" | "gold" | "blue" | "muted"> = {
  DOMESTIC: "olive",
  INTERNATIONAL: "gold",
};

const YEAR_LABEL: Record<string, string> = {
  YEAR_1: "Year 1",
  YEAR_2: "Year 2",
};

function daysSince(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

export function PipelineBoard({ columns: initialColumns, canDrag }: { columns: Column[]; canDrag: boolean }) {
  const router = useRouter();
  const [columns, setColumns] = useState(initialColumns);
  // dragging: which card id is being dragged
  const draggingId = useRef<string | null>(null);
  const draggingStage = useRef<string | null>(null);
  // drop target: stage + card id we're hovering over (null cardId = drop at end of column)
  const [dropTarget, setDropTarget] = useState<{ stage: string; cardId: string | null } | null>(null);

  function findCard(id: string) {
    for (const col of columns) {
      const card = col.applications.find((a) => a.id === id);
      if (card) return { card, stage: col.stage };
    }
    return null;
  }

  function handleDragStart(e: React.DragEvent, appId: string, stage: string) {
    if (!canDrag) return;
    draggingId.current = appId;
    draggingStage.current = stage;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, stage: string, cardId: string | null) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggingId.current) return;
    setDropTarget({ stage, cardId });
  }

  function handleDrop(e: React.DragEvent, targetStage: string, targetCardId: string | null) {
    e.preventDefault();
    e.stopPropagation();
    const id = draggingId.current;
    if (!id) return;

    const source = findCard(id);
    if (!source) return;

    // Build the new columns state
    const newColumns = columns.map((col) => ({ ...col, applications: [...col.applications] }));

    // Remove card from its current column
    const srcCol = newColumns.find((c) => c.stage === source.stage)!;
    srcCol.applications = srcCol.applications.filter((a) => a.id !== id);

    // Insert into target column at the right position
    const dstCol = newColumns.find((c) => c.stage === targetStage)!;
    const card = { ...source.card, currentStage: targetStage };

    if (targetCardId === null) {
      // Drop at end
      dstCol.applications.push(card);
    } else {
      const idx = dstCol.applications.findIndex((a) => a.id === targetCardId);
      dstCol.applications.splice(idx, 0, card);
    }

    setColumns(newColumns);
    setDropTarget(null);
    draggingId.current = null;
    draggingStage.current = null;

    // If stage changed, call stage API
    if (source.stage !== targetStage) {
      fetch(`/api/admin/applicants/${id}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage, notes: "Moved via pipeline board" }),
      });
    }

    // Always persist the new sort order for the destination column
    fetch("/api/admin/pipeline/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: dstCol.applications.map((a) => a.id) }),
    }).then(() => router.refresh());
  }

  function handleDragEnd() {
    draggingId.current = null;
    draggingStage.current = null;
    setDropTarget(null);
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-0 min-w-max h-full">
        {columns.map((col) => (
          <div
            key={col.stage}
            className="w-56 flex flex-col border-r"
            onDragOver={(e) => {
              // Allow dropping on the empty area at the bottom of a column
              e.preventDefault();
              if (!draggingId.current) return;
              setDropTarget({ stage: col.stage, cardId: null });
            }}
            onDrop={(e) => handleDrop(e, col.stage, null)}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between sticky top-0 bg-surface z-10">
              <span className="text-xs font-semibold text-text uppercase tracking-wide">{col.label}</span>
              <span className="text-xs font-bold text-text-muted bg-surface-dark px-1.5 py-0.5">{col.applications.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-0">
              {col.applications.map((app) => {
                const isDropAbove = dropTarget?.stage === col.stage && dropTarget?.cardId === app.id;
                const isDragging = draggingId.current === app.id;

                return (
                  <div key={app.id}>
                    {/* Drop indicator line above this card */}
                    <div
                      className={[
                        "h-0.5 mx-1 transition-all",
                        isDropAbove ? "bg-gold mb-1" : "mb-0",
                      ].join(" ")}
                    />
                    <div
                      draggable={canDrag}
                      onDragStart={(e) => handleDragStart(e, app.id, col.stage)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, col.stage, app.id)}
                      onDrop={(e) => handleDrop(e, col.stage, app.id)}
                      className={[
                        "bg-white p-3 mb-2 transition-all",
                        isDragging ? "opacity-30" : "hover:border-green/40",
                        canDrag ? "cursor-grab active:cursor-grabbing" : "",
                      ].join(" ")}
                    >
                      <Link href={`/admin/applicants/${app.id}`} className="block">
                        <p className="text-xs font-semibold text-text leading-tight">
                          {app.student.firstName} {app.student.lastName}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{app.applicantNumber} · {daysSince(app.updatedAt)}d</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant={CATEGORY_VARIANT[app.category] ?? "muted"}>
                            {app.category === "DOMESTIC" ? "DOM" : "INTL"}
                          </Badge>
                          <Badge variant="muted">{YEAR_LABEL[app.yearLevel]}</Badge>
                        </div>
                        {app.flagNote && (
                          <p className="text-xs text-gold mt-1.5 font-medium truncate">{app.flagNote}</p>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Drop zone at the bottom of an empty or partially-filled column */}
              <div
                className={[
                  "flex-1 min-h-8 rounded transition-colors",
                  dropTarget?.stage === col.stage && dropTarget?.cardId === null && col.applications.every(a => a.id !== draggingId.current)
                    ? "bg-gold/10"
                    : "",
                ].join(" ")}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggingId.current) setDropTarget({ stage: col.stage, cardId: null });
                }}
                onDrop={(e) => handleDrop(e, col.stage, null)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
