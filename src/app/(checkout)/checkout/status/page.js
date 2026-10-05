import { Suspense } from "react";
import { CheckoutStatusView } from "./checkout-status-view";

export const metadata = {
  title: "Confirming payment…",
  robots: { index: false },
};

export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-background">
          <div className="size-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      }
    >
      <CheckoutStatusView />
    </Suspense>
  );
}
