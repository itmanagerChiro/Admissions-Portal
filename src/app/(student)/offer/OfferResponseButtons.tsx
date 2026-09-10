"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function OfferResponseButtons({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function decline() {
    setIsLoading(true);
    setError("");
    const res = await fetch(`/api/student/offers/${offerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: "DECLINED" }),
    });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        <Button variant="ghost" onClick={decline} isLoading={isLoading}>
          Decline Offer
        </Button>
      </div>
      {error && <p className="text-sm text-red-flag">{error}</p>}
    </div>
  );
}
