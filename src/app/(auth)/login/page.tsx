"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setResendStatus("idle");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      if (result.code === "EMAIL_NOT_VERIFIED") {
        setError("Please verify your email before signing in. Check your inbox for the verification link.");
        setUnverified(true);
      } else {
        setError("Invalid email or password.");
      }
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleResend() {
    setResendStatus("sending");
    await fetch("/api/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResendStatus("sent");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="w-full bg-green h-8" />
      <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/nzcc-ws-logo-black.png"
            alt="New Zealand College of Chiropractic"
            width={320}
            height={108}
            className="mx-auto mb-6"
          />
          <h1 className="font-serif text-2xl font-bold text-text">Applicant Portal</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="text-sm text-red-flag bg-red-flag/5 border border-red-flag/20 rounded-lg px-3 py-2">
                <p>{error}</p>
                {unverified && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendStatus !== "idle"}
                    className="mt-1.5 font-semibold underline disabled:opacity-60"
                  >
                    {resendStatus === "sent" ? "Verification email sent" : resendStatus === "sending" ? "Sending…" : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            <Button type="submit" isLoading={isLoading} className="w-full justify-center">
              Sign in
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-text-muted hover:text-green transition-colors">
              Forgot password?
            </Link>
            <Link href="/register" className="text-green hover:text-green-dark transition-colors font-semibold">
              Create account
            </Link>
          </div>
        </div>
      </div>
      </div>
      <footer className="text-center text-xs text-text-light py-4">
        Designed by Kinetics Group
      </footer>
    </div>
  );
}
