import { Suspense } from "react";
import { VerifyEmailClient } from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green rounded-full mb-4">
            <span className="text-white font-serif font-bold text-lg">N</span>
          </div>
          <h1 className="font-serif text-2xl text-text">Email Verification</h1>
        </div>
        <Suspense fallback={<div className="bg-white rounded-xl shadow-sm p-8 text-center text-sm text-text-muted">Loading…</div>}>
          <VerifyEmailClient />
        </Suspense>
      </div>
    </div>
  );
}
