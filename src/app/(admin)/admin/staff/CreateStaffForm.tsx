"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function CreateStaffForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, isGlobalAdmin }),
    });
    setIsLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to create staff user.");
      return;
    }
    setOpen(false);
    setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setIsGlobalAdmin(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>+ New Staff User</Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 flex flex-col gap-4">
      <h2 className="font-serif text-base text-text">Create Staff Account</h2>
      {error && <p className="text-xs text-red-flag">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input label="Temporary Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
        <input
          type="checkbox"
          checked={isGlobalAdmin}
          onChange={(e) => setIsGlobalAdmin(e.target.checked)}
          className="accent-olive"
        />
        Global Admin (all permissions)
      </label>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit" size="sm" isLoading={isLoading}>Create Staff User</Button>
      </div>
    </form>
  );
}
