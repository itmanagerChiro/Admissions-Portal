"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full px-4 py-2.5 rounded-lg text-sm text-text",
            "placeholder:text-text-light",
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
        />
        {error && <p className="text-xs text-red-flag">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
