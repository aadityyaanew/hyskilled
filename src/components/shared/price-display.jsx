import { formatPrice, discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { price: "text-lg", old: "text-xs" },
  md: { price: "text-2xl", old: "text-sm" },
  lg: { price: "text-4xl", old: "text-base" },
};

export function PriceDisplay({
  price,
  originalPrice,
  size = "md",
  showDiscount = true,
  className,
  tone = "light",
}) {
  const off = discountPercent(originalPrice, price);
  const s = sizes[size];
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span
        className={cn(
          "font-heading font-bold tracking-tight",
          s.price,
          tone === "dark" ? "text-white" : "text-ink"
        )}
      >
        {formatPrice(price)}
      </span>
      {off > 0 && (
        <>
          <span
            className={cn(
              "line-through",
              s.old,
              tone === "dark" ? "text-white/50" : "text-muted-foreground"
            )}
          >
            {formatPrice(originalPrice)}
          </span>
          {showDiscount && (
            <span className={cn("font-semibold", s.old, tone === "dark" ? "text-brand-300" : "text-emerald-600")}>
              {off}% off
            </span>
          )}
        </>
      )}
    </div>
  );
}
