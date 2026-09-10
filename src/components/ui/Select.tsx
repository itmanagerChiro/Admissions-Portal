"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-semibold text-text">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            "w-full px-4 py-2.5 rounded-lg text-sm text-text",
            "focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors",
            className,
          ].join(" ")}
          style={{
            backgroundColor: "#F8F8F6",
            border: error ? "1.5px solid #c0392b" : "1.5px solid rgba(0,0,0,0.1)",
          }}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-flag">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
