import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Booking Status",
  description: "Your seat booking payment status.",
  path: "/register-seat/status",
  noIndex: true,
});

export default async function SeatBookingStatusPage({ searchParams }) {
  const params = await searchParams;
  const orderId = params?.order_id ?? "";
  // Cashfree appends ?order_id=... and the SDK resolves with a status on redirect.
  // We treat the presence of order_id as a successful redirect from the gateway.
  // A webhook (POST /api/payments/webhook) is the source of truth on the server.
  const isSuccess = Boolean(orderId);

  return (
    <div className="section-y">
      <div className="container-page">
        <div className="mx-auto max-w-lg text-center">
          {isSuccess ? (
            <>
              <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="size-10" />
              </span>
              <h1 className="mt-6 font-heading text-3xl font-bold text-ink sm:text-4xl">
                Seat Booked!
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
                Your ₹2500 booking has been received (Order ID:{" "}
                <span className="font-mono text-sm font-semibold text-ink">{orderId}</span>).
                Our team will contact you within 24 hours to confirm your place and share
                onboarding details.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm font-semibold text-primary">
                Booking amount will be adjusted against your tuition fees.
              </p>
            </>
          ) : (
            <>
              <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-destructive/10 text-destructive">
                <XCircle className="size-10" />
              </span>
              <h1 className="mt-6 font-heading text-3xl font-bold text-ink sm:text-4xl">
                Payment Unsuccessful
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
                We could not confirm your payment. No amount has been deducted. Please try again
                or contact us if the issue persists.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="brand">
              <Link href={ROUTES.registerSeat}>
                {isSuccess ? "Register another seat" : "Try again"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={ROUTES.home}>Go to homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
