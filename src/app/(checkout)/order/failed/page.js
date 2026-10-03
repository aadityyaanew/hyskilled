import { Suspense } from "react";
import { OrderFailedView } from "@/features/orders/order-failed-view";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Payment Failed",
  description: "Your payment could not be completed.",
  path: "/order/failed",
  noIndex: true,
});

export default function OrderFailedPage() {
  return (
    <div className="container-page py-10 lg:py-16">
      <Suspense fallback={<div className="skeleton-shimmer mx-auto h-96 max-w-2xl rounded-3xl" />}>
        <OrderFailedView />
      </Suspense>
    </div>
  );
}
