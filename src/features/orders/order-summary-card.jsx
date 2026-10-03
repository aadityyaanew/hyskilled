"use client";

import { CourseCover } from "@/features/courses/course-cover";
import { TotalsBreakdown } from "@/features/cart/totals-breakdown";
import { paymentMethods } from "@/config/payments";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const statusMap = {
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  pending: { label: "Pending", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export function OrderStatusBadge({ status }) {
  const s = statusMap[status] ?? statusMap.pending;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

/** Receipt-style summary of an order. */
export function OrderSummaryCard({ order, className }) {
  const method = paymentMethods.find((m) => m.id === order.paymentMethod);
  return (
    <div className={className}>
      <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Order ID</dt>
          <dd className="mt-0.5 font-mono font-bold text-ink">{order.id}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Date</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            {formatDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Payment</dt>
          <dd className="mt-0.5 font-semibold text-ink">{method?.label ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Status</dt>
          <dd className="mt-0.5">
            <OrderStatusBadge status={order.status} />
          </dd>
        </div>
      </dl>

      <ul className="mt-6 divide-y rounded-2xl border bg-white">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            <CourseCover
              course={{ slug: item.slug, categorySlug: item.categorySlug }}
              size="xs"
              className="size-14 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-semibold text-ink">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <p className="font-bold text-ink">{formatPrice(item.price)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 ml-auto max-w-sm">
        <TotalsBreakdown totals={order.totals} couponCode={order.coupon?.code} emphasize={false} />
      </div>
    </div>
  );
}
