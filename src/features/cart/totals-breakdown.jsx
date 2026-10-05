import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Price breakdown shared by the cart, drawer, checkout and order pages. */
export function TotalsBreakdown({ totals, couponCode, className, emphasize = true }) {
  const { subtotal, savings, discount, tax, total, listTotal } = totals;
  const { label, inclusive, rate } = siteConfig.tax;

  return (
    <dl className={cn("space-y-2.5 text-sm", className)}>
      {savings > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <dt>List price</dt>
          <dd className="line-through">{formatPrice(listTotal, { precise: !Number.isInteger(listTotal) })}</dd>
        </div>
      )}
      {savings > 0 && (
        <div className="flex justify-between text-emerald-700">
          <dt>Course discounts</dt>
          <dd>-{formatPrice(savings)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd className="font-medium">{formatPrice(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-emerald-700">
          <dt>Coupon {couponCode && <span className="font-semibold">({couponCode})</span>}</dt>
          <dd className="font-medium">-{formatPrice(discount, { precise: !Number.isInteger(discount) })}</dd>
        </div>
      )}
      <div
        className={cn(
          "flex items-baseline justify-between border-t pt-3",
          emphasize && "text-lg"
        )}
      >
        <dt className="font-bold text-ink">Enrollment Total</dt>
        <dd className="font-heading text-2xl font-bold text-ink">
          {formatPrice(total, { precise: !Number.isInteger(total) })}
        </dd>
      </div>
    </dl>
  );
}
