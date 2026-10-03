import { Check, Clock, Layers, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { PriceDisplay } from "@/components/shared/price-display";
import { bundleToLineItem } from "@/lib/line-items";
import { discountPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Career-track bundle pricing card. `bundle` comes from bundles.service. */
export function BundleCard({ bundle }) {
  const featured = bundle.highlight;
  const off = discountPercent(bundle.originalPrice, bundle.price);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[2rem] border p-7 transition-all duration-300 hover:-translate-y-1.5 sm:p-8",
        featured
          ? "border-transparent bg-gradient-to-b from-brand-700 via-brand-800 to-brand-950 text-white shadow-glow lg:scale-[1.04]"
          : "bg-card hover:border-brand-200 hover:shadow-lift"
      )}
    >
      {featured && (
        <>
          <div aria-hidden className="bg-grid-dark pointer-events-none absolute inset-0 rounded-[2rem] opacity-50" />
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1 bg-amber-400 px-3 text-amber-950">
            <Sparkles className="size-3" /> Most popular
          </Badge>
        </>
      )}

      <div className="relative">
        <p className={cn("text-xs font-bold tracking-wider uppercase", featured ? "text-brand-200" : "text-primary")}>
          {bundle.tagline}
        </p>
        <h3 className={cn("mt-2 text-2xl font-bold", featured ? "text-white" : "text-ink")}>{bundle.name}</h3>
        <p className={cn("mt-2 text-sm", featured ? "text-white/70" : "text-muted-foreground")}>
          {bundle.description}
        </p>

        <div className="mt-6">
          <PriceDisplay price={bundle.price} originalPrice={bundle.originalPrice} size="lg" tone={featured ? "dark" : "light"} />
          <p className={cn("mt-1 text-sm font-semibold", featured ? "text-brand-200" : "text-emerald-700")}>
            You save ₹{bundle.savings.toLocaleString("en-IN")} ({off}% off)
          </p>
        </div>

        <div className={cn("mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm", featured ? "text-white/70" : "text-muted-foreground")}>
          <span className="inline-flex items-center gap-1.5"><Layers className="size-4" />{bundle.courses.length} courses</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" />{bundle.totalHours} hrs</span>
        </div>

        <ul className="mt-6 space-y-3">
          {bundle.courses.map((c) => (
            <li key={c.slug} className="flex items-start gap-3 text-sm">
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                  featured ? "bg-white/20 text-white" : "bg-brand-50 text-primary"
                )}
              >
                <Check className="size-3.5" />
              </span>
              <span className={featured ? "text-white/90" : "text-ink-soft"}>{c.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-8 flex-1" />
      <div className="relative">
        <AddToCartButton
          item={bundleToLineItem(bundle)}
          buyNow
          size="lg"
          variant={featured ? "light" : "brand"}
          className="w-full"
        >
          Get this track
        </AddToCartButton>
        <p className={cn("mt-3 text-center text-xs", featured ? "text-white/60" : "text-muted-foreground")}>
          One-time payment · Lifetime access
        </p>
      </div>
    </div>
  );
}
