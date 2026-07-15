export function WipBanner({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6"
      style={{ backgroundColor: "rgba(199,154,59,0.1)", border: "1px solid rgba(199,154,59,0.35)" }}
    >
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#C79A3B" }}>
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "#8a6416" }}>Work in progress</p>
        <p className="text-sm" style={{ color: "#7a5a12" }}>{children}</p>
      </div>
    </div>
  );
}
