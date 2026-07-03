"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface PendingTask {
  id: string;
  title: string;
}

interface DocumentUploadFormProps {
  applicationId: string;
  pendingTasks: PendingTask[];
}

export function DocumentUploadForm({ applicationId, pendingTasks }: DocumentUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("GENERAL");
  const [taskId, setTaskId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    if (taskId) formData.append("taskId", taskId);

    const res = await fetch("/api/student/documents", { method: "POST", body: formData });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed.");
      return;
    }

    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files[0];
          if (dropped) setFile(dropped);
        }}
        className="p-8 text-center transition-colors rounded-xl"
        style={{
          border: `2px dashed ${isDragging ? "#114E3B" : "rgba(0,0,0,0.12)"}`,
          backgroundColor: isDragging ? "rgba(17,78,59,0.04)" : "#F8F8F6",
        }}
      >
        <input type="file" id="doc-upload" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
        <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center gap-2">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {file ? (
            <span className="text-sm font-medium text-text">{file.name}</span>
          ) : (
            <span className="text-sm text-text-muted">Upload Admissions Essay</span>
          )}
          <span className="text-xs text-text-light">PDF or Word document · Max 5MB</span>
        </label>
      </div>

      <div className="flex gap-3">
        {pendingTasks.length > 0 && (
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="flex-1 px-3 py-2.5 text-sm text-text focus:outline-none rounded-lg"
            style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
          >
            <option value="">No linked task</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        )}
        <Button type="submit" isLoading={isLoading} disabled={!file}>
          Upload
        </Button>
      </div>

      {error && <p className="text-sm text-red-flag">{error}</p>}
    </form>
  );
}
