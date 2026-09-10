"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface EditApplicantFormProps {
  applicationId: string;
  initial: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    postcode: string;
    country: string;
    guardianName: string;
    guardianEmail: string;
    guardianPhone: string;
    gpaScore: string;
    prerequisitesMet: boolean;
  };
}

export function EditApplicantForm({ applicationId, initial }: EditApplicantFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const res = await fetch(`/api/admin/applicants/${applicationId}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, gpaScore: form.gpaScore === "" ? null : form.gpaScore }),
    });
    setIsLoading(false);
    if (!res.ok) {
      setError("Failed to save. Please try again.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold transition-colors"
        style={{ color: "#114E3B" }}
      >
        Edit →
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="font-serif text-lg text-text">Edit Applicant Details</h2>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "#aaa" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#999" }}>Personal</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
              <Input label="Last name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-semibold text-text mb-1.5">Email</label>
              <div className="px-4 py-2.5 rounded-lg text-sm" style={{ backgroundColor: "#F2F2F0", color: "#aaa", border: "1.5px solid rgba(0,0,0,0.06)" }}>
                {initial.email}
                <span className="ml-2 text-xs" style={{ color: "#ccc" }}>(not editable)</span>
              </div>
            </div>
            <div className="mt-3">
              <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="mt-3">
              <Input label="GPA" type="number" step="0.01" value={form.gpaScore} onChange={(e) => set("gpaScore", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm mt-3" style={{ color: "#333" }}>
              <input type="checkbox" checked={form.prerequisitesMet} onChange={(e) => set("prerequisitesMet", e.target.checked)} />
              Prerequisites met
            </label>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#999" }}>Address</p>
            <div className="flex flex-col gap-3">
              <Input label="Street address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
                <Input label="Postcode" value={form.postcode} onChange={(e) => set("postcode", e.target.value)} />
              </div>
              <Input label="Country" value={form.country} onChange={(e) => set("country", e.target.value)} />
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#999" }}>Guardian / Emergency Contact</p>
            <div className="flex flex-col gap-3">
              <Input label="Name" value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} />
              <Input label="Email" type="email" value={form.guardianEmail} onChange={(e) => set("guardianEmail", e.target.value)} />
              <Input label="Phone" value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} />
            </div>
          </div>

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#c0392b", backgroundColor: "rgba(192,57,43,0.06)" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-1" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
