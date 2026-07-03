"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "updatedAt_desc", label: "Recently updated" },
  { value: "updatedAt_asc", label: "Oldest updated" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "stage_asc", label: "Stage (earliest first)" },
  { value: "stage_desc", label: "Stage (latest first)" },
  { value: "createdAt_desc", label: "Newest application" },
  { value: "createdAt_asc", label: "Oldest application" },
];

interface ApplicantsControlsProps {
  stages: { value: string; label: string }[];
  defaultSearch?: string;
  defaultStage?: string;
  defaultType?: string;
  defaultYear?: string;
  defaultSort?: string;
}

const selectStyle = {
  backgroundColor: "#fff",
  border: "1.5px solid rgba(0,0,0,0.1)",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 14,
  color: "#333",
  outline: "none",
};

export function ApplicantsControls({
  stages,
  defaultSearch = "",
  defaultStage = "",
  defaultType = "",
  defaultYear = "",
  defaultSort = "updatedAt_desc",
}: ApplicantsControlsProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function submit() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const p = new URLSearchParams();
    for (const [k, v] of data.entries()) {
      if (v) p.set(k, v as string);
    }
    router.push(`/admin/applicants?${p.toString()}`);
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="flex gap-2 mb-6 flex-wrap items-center"
    >
      <input
        name="search"
        defaultValue={defaultSearch}
        placeholder="Search name, email or ID…"
        className="flex-1 min-w-48 px-4 py-2 text-sm rounded-lg shadow-sm focus:outline-none text-text placeholder:text-text-light"
        style={{ backgroundColor: "#fff", border: "1.5px solid rgba(0,0,0,0.1)" }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <select name="stage" defaultValue={defaultStage} onChange={submit} style={selectStyle}>
        <option value="">All stages</option>
        {stages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <select name="type" defaultValue={defaultType} onChange={submit} style={selectStyle}>
        <option value="">All types</option>
        <option value="DOMESTIC">Domestic</option>
        <option value="INTERNATIONAL">International</option>
      </select>
      <select name="year" defaultValue={defaultYear} onChange={submit} style={selectStyle}>
        <option value="">Year 1 &amp; 2</option>
        <option value="YEAR_1">Year 1</option>
        <option value="YEAR_2">Year 2</option>
      </select>
      <select name="sort" defaultValue={defaultSort} onChange={submit} style={{ ...selectStyle, color: "#114E3B", fontWeight: 600 }}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <button
        type="submit"
        className="px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ backgroundColor: "#114E3B", color: "#fff" }}
      >
        Search
      </button>
    </form>
  );
}
