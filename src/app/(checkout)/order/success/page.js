import { Suspense } from "react";
import { OrderSuccessView } from "@/features/orders/order-success-view";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Order Confirmed",
  description: "Your Hyskilled purchase was successful.",
  path: "/order/success",
  noIndex: true,
});

export default function OrderSuccessPage() {
  return (
    <div className="container-page py-10 lg:py-16">
      <Suspense fallback={<div className="skeleton-shimmer mx-auto h-96 max-w-3xl rounded-3xl" />}>
        <OrderSuccessView />
      </Suspense>
    </div>
  );
}
