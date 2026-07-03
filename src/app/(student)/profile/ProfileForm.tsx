"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProfileFormProps {
  userId: string;
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postcode: string;
    country: string;
    currentSchool: string;
    guardianName: string;
    guardianEmail: string;
    guardianPhone: string;
  };
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [form, setForm] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setIsLoading(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Personal */}
      <section className="bg-white p-6">
        <h2 className="font-serif text-base text-text mb-5">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          <Input label="Last name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          <Input label="Email address" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="col-span-2" />
          <Input label="Phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="col-span-2" />
        </div>
      </section>

      {/* Address */}
      <section className="bg-white p-6">
        <h2 className="font-serif text-base text-text mb-5">Address</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Street address" value={form.address} onChange={(e) => set("address", e.target.value)} className="col-span-2" />
          <Input label="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
          <Input label="Postcode" value={form.postcode} onChange={(e) => set("postcode", e.target.value)} />
          <Input label="Country" value={form.country} onChange={(e) => set("country", e.target.value)} className="col-span-2" />
        </div>
      </section>

      {/* Guardian */}
      <section className="bg-white p-6">
        <h2 className="font-serif text-base text-text mb-5">Emergency Contact / Guardian</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full name" value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} className="col-span-2" />
          <Input label="Email" type="email" value={form.guardianEmail} onChange={(e) => set("guardianEmail", e.target.value)} />
          <Input label="Phone" type="tel" value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" isLoading={isLoading}>Save changes</Button>
        {saved && <p className="text-sm text-emerald-600">Changes saved.</p>}
      </div>
    </form>
  );
}
