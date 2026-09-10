"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type Method = "BANK_TRANSFER" | "CREDIT_CARD";

const METHODS: { key: Method; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: "BANK_TRANSFER",
    label: "Bank Transfer",
    description: "Pay via direct bank transfer. Your offer will be accepted once staff confirm the payment.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M4 21V9l8-6 8 6v12M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    key: "CREDIT_CARD",
    label: "Credit Card",
    description: "Pay securely online with a debit or credit card. Your offer is accepted immediately.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 8h20M2 8v9a2 2 0 002 2h16a2 2 0 002-2V8M2 8V6a2 2 0 012-2h16a2 2 0 012 2v2M6 15h4" />
      </svg>
    ),
  },
];

export function PaymentMethodPicker() {
  const router = useRouter();
  const [activeMethod, setActiveMethod] = useState<Method | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirmPayment(method: Method) {
    setIsLoading(true);
    setError("");
    const res = await fetch("/api/student/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method }),
    });
    setIsLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setActiveMethod(null);
    router.refresh();
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3">
        {METHODS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMethod(m.key)}
            className="flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-colors hover:opacity-90"
            style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.08)" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#114E3B", color: "#fff" }}>
              {m.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#222" }}>{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#888" }}>{m.description}</p>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#bbb" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-flag mt-3">{error}</p>}

      {/* Bank Transfer */}
      <Modal isOpen={activeMethod === "BANK_TRANSFER"} onClose={() => setActiveMethod(null)} title="Bank Transfer">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-muted">Please transfer your deposit using the account details below and reference your applicant number.</p>
          <dl className="bg-surface rounded-lg p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><dt className="text-text-muted">Account Name</dt><dd className="font-medium text-text">NZ College of Chiropractic</dd></div>
            <div className="flex justify-between"><dt className="text-text-muted">Account Number</dt><dd className="font-mono font-medium text-text">12-3456-7890123-00</dd></div>
            <div className="flex justify-between"><dt className="text-text-muted">Reference</dt><dd className="font-medium text-text">Your applicant number</dd></div>
          </dl>
          <div className="rounded-lg px-4 py-3" style={{ backgroundColor: "#FFF8ED", border: "1px solid rgba(199,154,59,0.3)" }}>
            <p className="text-xs" style={{ color: "#8a6416" }}>
              Your offer will remain pending until NZCC staff confirm your transfer has been received.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setActiveMethod(null)}>Cancel</Button>
            <Button onClick={() => confirmPayment("BANK_TRANSFER")} isLoading={isLoading}>I've made the transfer</Button>
          </div>
        </div>
      </Modal>

      {/* Credit Card */}
      <Modal isOpen={activeMethod === "CREDIT_CARD"} onClose={() => setActiveMethod(null)} title="Pay by Credit Card">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Card number</label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              className="w-full px-3 py-2.5 text-sm rounded-lg"
              style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text mb-1.5">Expiry</label>
              <input
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/YY"
                className="w-full px-3 py-2.5 text-sm rounded-lg"
                style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text mb-1.5">CVC</label>
              <input
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="123"
                className="w-full px-3 py-2.5 text-sm rounded-lg"
                style={{ backgroundColor: "#F8F8F6", border: "1.5px solid rgba(0,0,0,0.1)" }}
              />
            </div>
          </div>
          <p className="text-xs" style={{ color: "#aaa" }}>This is a demonstration form (Stripe integration placeholder). No card details are transmitted or stored.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setActiveMethod(null)}>Cancel</Button>
            <Button onClick={() => confirmPayment("CREDIT_CARD")} isLoading={isLoading}>Pay &amp; Accept Offer</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
