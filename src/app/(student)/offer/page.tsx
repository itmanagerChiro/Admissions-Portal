import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { OfferConditionCard } from "./OfferConditionCard";
import { OfferResponseButtons } from "./OfferResponseButtons";
import { PaymentMethodPicker } from "./PaymentMethodPicker";

const DEPOSIT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank Transfer",
  CREDIT_CARD: "Credit Card",
};

export default async function OfferPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true, depositStatus: true, depositMethod: true, depositPaidAt: true },
  });
  if (!application) return <div className="p-8 text-text-muted">Application not found.</div>;

  const offer = await prisma.offer.findFirst({
    where: { applicationId: application.id },
    orderBy: { issuedAt: "desc" },
    include: {
      conditions: {
        include: { evidenceDocuments: { orderBy: { uploadedAt: "desc" } } },
      },
    },
  });

  if (!offer) {
    return (
      <div className="px-8 py-8 max-w-2xl">
        <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">Enrolment</p>
        <h1 className="font-serif text-3xl text-text mb-2">Your Offer</h1>
        <p className="text-sm text-text-muted">You don't have an offer yet. Check back once your application has been reviewed.</p>
      </div>
    );
  }

  const allConditionsMet = offer.conditions.every((c) => c.status !== "PENDING");
  const canProceedToPayment = offer.responseStatus === "PENDING" && (offer.type === "UNCONDITIONAL" || allConditionsMet);

  return (
    <div className="px-8 py-8 max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">Enrolment</p>
      <h1 className="font-serif text-3xl text-text mb-2">Your Offer</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg text-text">
            {offer.type === "CONDITIONAL" ? "Conditional Offer of Place" : "Unconditional Offer of Place"}
          </h2>
          <Badge
            variant={
              offer.responseStatus === "ACCEPTED"
                ? "green"
                : offer.responseStatus === "DECLINED"
                ? "red"
                : offer.responseStatus === "EXPIRED"
                ? "muted"
                : "gold"
            }
          >
            {offer.responseStatus}
          </Badge>
        </div>

        {offer.acceptanceDeadline && (
          <p className="text-sm text-text-muted mb-4">
            Please respond by <strong>{new Date(offer.acceptanceDeadline).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}</strong>.
          </p>
        )}

        {offer.notes && <p className="text-sm text-text-muted mb-4">{offer.notes}</p>}

        {offer.conditions.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#999" }}>Conditions</p>
            <div className="flex flex-col gap-3">
              {offer.conditions.map((c) => (
                <OfferConditionCard
                  key={c.id}
                  condition={{
                    ...c,
                    satisfiedAt: c.satisfiedAt ? c.satisfiedAt.toISOString() : null,
                  }}
                  canUpload={offer.responseStatus === "PENDING"}
                />
              ))}
            </div>
          </div>
        )}

        {offer.responseStatus === "PENDING" && application.depositStatus !== "PENDING_REVIEW" && (
          <OfferResponseButtons offerId={offer.id} />
        )}
      </div>

      {offer.responseStatus === "PENDING" && canProceedToPayment && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif text-lg text-text mb-1">Accept Your Offer &amp; Pay Deposit</h2>

          {application.depositStatus === "PENDING_REVIEW" ? (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(199,154,59,0.15)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#C79A3B" }}>
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-base text-text">Awaiting Confirmation</h3>
                  <Badge variant="gold">Pending Review</Badge>
                </div>
                <p className="text-sm text-text-muted">
                  We've received confirmation of your bank transfer. Your offer will be accepted once NZCC staff
                  verify the payment against our bank records.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-text-muted mb-5">
                To accept this offer, pay your enrolment deposit using one of the options below. Paying by credit
                card accepts your offer immediately; a bank transfer will be confirmed by our staff before your
                offer is accepted.
              </p>
              <PaymentMethodPicker />
              <p className="text-xs mt-4" style={{ color: "#aaa" }}>
                This is a demonstration screen. No real payment is processed.
              </p>
            </>
          )}
        </div>
      )}

      {offer.responseStatus === "ACCEPTED" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(34,197,94,0.12)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: "#22c55e" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-serif text-base text-text">Deposit Received</h3>
                <Badge variant="green">Paid</Badge>
              </div>
              <p className="text-sm text-text-muted">
                Paid via {DEPOSIT_METHOD_LABELS[application.depositMethod ?? ""]}
                {application.depositPaidAt ? ` on ${new Date(application.depositPaidAt).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
