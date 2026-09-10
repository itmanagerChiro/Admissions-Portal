"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface IntakeOption {
  id: string;
  label: string;
}

export function IntakeFilterPicker({ intakeYears }: { intakeYears: IntakeOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("intake");
    else params.set("intake", value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <select
      value={searchParams.get("intake") ?? "all"}
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white"
      style={{ border: "1.5px solid rgba(0,0,0,0.1)", color: "#333" }}
    >
      <option value="all">All Visible Intakes</option>
      {intakeYears.map((iy) => (
        <option key={iy.id} value={iy.id}>{iy.label}</option>
      ))}
    </select>
  );
}
