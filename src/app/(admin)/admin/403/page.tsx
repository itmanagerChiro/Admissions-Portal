import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center">
      <p className="text-7xl font-serif font-bold text-green/20 mb-4">403</p>
      <h1 className="font-serif text-2xl text-text mb-2">Access Denied</h1>
      <p className="text-sm text-text-muted mb-6 max-w-sm">
        You don&apos;t have permission to view this page. Contact a Global Admin to request access.
      </p>
      <Link
        href="/admin"
        className="px-5 py-2.5 bg-green text-white text-sm font-semibold hover:bg-green-dark transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
