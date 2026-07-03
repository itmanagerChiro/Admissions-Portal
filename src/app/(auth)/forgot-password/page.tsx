import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green rounded-full mb-4">
            <span className="text-white font-serif font-bold text-lg">N</span>
          </div>
          <h1 className="font-serif text-2xl text-text">Reset Password</h1>
          <p className="text-sm text-text-muted mt-1">Contact your admissions coordinator</p>
        </div>
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Password resets are handled by the NZCC admissions team. Please email{" "}
            <a href="mailto:admissions@nzcc.ac.nz" className="text-green hover:underline">
              admissions@nzcc.ac.nz
            </a>{" "}
            with your registered email address.
          </p>
          <Link
            href="/login"
            className="text-sm text-green hover:text-text font-medium transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
