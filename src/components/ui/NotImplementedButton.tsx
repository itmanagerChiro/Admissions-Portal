"use client";

import { useState } from "react";

export function NotImplementedButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowMessage(true)}
        onBlur={() => setShowMessage(false)}
        className={className}
        style={{ backgroundColor: "rgba(0,0,0,0.15)", color: "rgba(0,0,0,0.4)", cursor: "not-allowed" }}
      >
        {children}
      </button>
      {showMessage && (
        <div
          className="absolute right-0 mt-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap z-10 shadow-lg"
          style={{ backgroundColor: "#222", color: "#fff" }}
        >
          Not yet implemented
        </div>
      )}
    </div>
  );
}
