"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

const variantClasses = {
  primary: "text-white border border-transparent shadow-sm",
  secondary: "bg-white border border-green hover:opacity-90",
  ghost: "bg-transparent border border-transparent",
  danger: "text-white border border-transparent",
  accent: "text-white border border-transparent shadow-sm",
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: "#114E3B", color: "#ffffff" },
  secondary: { color: "#114E3B" },
  ghost: { color: "#666666" },
  danger: { backgroundColor: "#c0392b", color: "#ffffff" },
  accent: { backgroundColor: "#C79A3B", color: "#ffffff" },
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-6 py-3 text-sm rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-opacity hover:opacity-90",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      style={variantStyles[variant]}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
