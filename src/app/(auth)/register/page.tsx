"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      }),
    });

    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed. Please try again.");
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="w-full bg-green h-8" />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/nzcc-ws-logo-black.png"
            alt="New Zealand College of Chiropractic"
            width={320}
            height={108}
            className="mx-auto mb-6"
          />
          <h1 className="font-serif text-2xl font-bold text-text">Create Account</h1>
          <p className="text-sm text-text-muted mt-1">Start your NZCC application</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                required
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                required
              />
            </div>
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              autoComplete="new-password"
              required
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              autoComplete="new-password"
              required
            />

            {error && (
              <p className="text-sm text-red-flag bg-red-flag/5 border border-red-flag/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full justify-center mt-1">
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-green hover:text-green-dark font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      </div>
      <footer className="text-center text-xs text-text-light py-4">
        Designed by Kinetics Group
      </footer>
    </div>
  );
}
