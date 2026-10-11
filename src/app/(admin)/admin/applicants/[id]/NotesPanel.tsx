"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface NoteData {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: { firstName: string; lastName: string };
}

export function NotesPanel({
  applicationId,
  notes,
  canAdd,
  currentUserId,
}: {
  applicationId: string;
  notes: NoteData[];
  canAdd: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  async function handleAdd() {
    if (!body.trim()) return;
    setIsLoading(true);
    setError("");
    const res = await fetch(`/api/admin/applicants/${applicationId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to add note.");
      return;
    }

    setBody("");
    router.refresh();
  }

  function startEdit(note: NoteData) {
    setEditingId(note.id);
    setEditBody(note.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
  }

  async function saveEdit(noteId: string) {
    if (!editBody.trim()) return;
    setIsSavingEdit(true);
    const res = await fetch(`/api/admin/applicants/${applicationId}/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: editBody }),
    });
    setIsSavingEdit(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save note.");
      return;
    }

    setEditingId(null);
    setEditBody("");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#555" }}>Internal Notes</p>
      </div>

      {canAdd && (
        <div className="px-5 py-4 flex flex-col gap-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Add a note visible to staff only…"
            className="w-full px-3 py-2.5 text-sm focus:outline-none text-text placeholder:text-text-light resize-none rounded-lg"
            style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
          />
          <div className="flex items-center justify-between">
            {error && <p className="text-xs text-red-flag">{error}</p>}
            <Button size="sm" onClick={handleAdd} isLoading={isLoading} disabled={!body.trim()} className="ml-auto">
              Add Note
            </Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="px-5 py-4 text-xs" style={{ color: "#888" }}>No notes yet.</p>
      ) : (
        <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          {notes.map((note) => {
            const isEditing = editingId === note.id;
            const isEdited = note.updatedAt !== note.createdAt;
            const canEditThis = canAdd && note.authorId === currentUserId;

            return (
              <div key={note.id} className="px-5 py-3">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={2}
                      autoFocus
                      className="w-full px-3 py-2.5 text-sm focus:outline-none text-text resize-none rounded-lg"
                      style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={cancelEdit} className="text-xs font-medium" style={{ color: "#888" }}>Cancel</button>
                      <Button size="sm" onClick={() => saveEdit(note.id)} isLoading={isSavingEdit} disabled={!editBody.trim()}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: "#333" }}>{note.body}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[11px]" style={{ color: "#aaa" }}>
                        {note.author.firstName} {note.author.lastName} · {new Date(note.createdAt).toLocaleString("en-NZ", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                        {isEdited && " · edited"}
                      </p>
                      {canEditThis && (
                        <button onClick={() => startEdit(note)} className="text-[11px] font-semibold" style={{ color: "#114E3B" }}>
                          Edit
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
