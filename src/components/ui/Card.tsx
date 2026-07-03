import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "bg-white rounded-xl shadow-sm",
        onClick ? "cursor-pointer hover:border-green/40 hover:shadow-md transition-all" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={["px-6 py-4 border-b border-surface-dark", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={["px-6 py-4", className].join(" ")}>
      {children}
    </div>
  );
}
