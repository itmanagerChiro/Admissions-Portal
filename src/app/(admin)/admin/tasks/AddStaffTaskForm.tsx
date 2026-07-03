"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AddStaffTaskForm({ staffId }: { staffId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsLoading(true);
    await fetch("/api/admin/staff/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate, assignedToId: staffId }),
    });
    setIsLoading(false);
    setTitle("");
    setDescription("");
    setDueDate("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        + Add Task
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#999" }}>New Internal Task</p>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div>
        <label className="block text-sm font-semibold text-text mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 text-sm focus:outline-none text-text placeholder:text-text-light resize-none rounded-lg"
          style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
        />
      </div>
      <Input label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isLoading}>Save Task</Button>
      </div>
    </form>
  );
}
