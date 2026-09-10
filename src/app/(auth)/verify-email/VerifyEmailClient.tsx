"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "verifying" | "success" | "error";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Verification failed.");
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [token]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
      {status === "verifying" && (
        <p className="text-sm text-text-muted">Verifying your email…</p>
      )}
      {status === "success" && (
        <>
          <p className="text-sm text-text mb-6">
            Your email has been verified. You can now sign in to your account.
          </p>
          <Link href="/login" className="text-sm text-green hover:text-text font-medium transition-colors">
            Continue to sign in →
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-sm text-red-flag bg-red-flag/5 border border-red-flag/20 rounded-lg px-3 py-2 mb-6">
            {message}
          </p>
          <Link href="/login" className="text-sm text-green hover:text-text font-medium transition-colors">
            ← Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}
