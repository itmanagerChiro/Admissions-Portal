import type { ReactNode } from "react";

type BadgeVariant =
  | "olive"
  | "gold"
  | "red"
  | "muted"
  | "green"
  | "blue"
  | "purple"
  | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  olive:   "bg-green text-white",
  green:   "bg-green/10 text-green",
  gold:    "bg-gold/15 text-amber-700",
  red:     "bg-red-flag/10 text-red-flag",
  muted:   "bg-surface-dark text-text-muted",
  blue:    "bg-blue-50 text-blue-700",
  purple:  "bg-purple-50 text-purple-700",
  outline: "bg-transparent text-text-muted",
};

export function Badge({ variant = "muted", children, className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
