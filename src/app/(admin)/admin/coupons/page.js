import { Tag, Percent, IndianRupee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAdminCoupons } from "@/services/admin.service";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Coupons & Discounts | Admin",
};

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Discount Coupons
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Manage promotional discount codes applied during checkout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {c.type === "percent" ? (
                    <Percent className="size-5" />
                  ) : (
                    <IndianRupee className="size-5" />
                  )}
                </span>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-xl font-extrabold text-foreground tracking-wider">
                  {c.code}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{c.description}</p>
            </div>

            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground space-y-1">
              <p>
                Discount:{" "}
                <span className="font-bold text-foreground">
                  {c.type === "percent" ? `${c.value}% OFF` : `Flat ${formatPrice(c.value)} OFF`}
                </span>
              </p>
              {c.min_order && (
                <p>
                  Min. Order:{" "}
                  <span className="font-medium text-foreground">{formatPrice(c.min_order)}</span>
                </p>
              )}
              {c.max_discount && (
                <p>
                  Max Discount:{" "}
                  <span className="font-medium text-foreground">{formatPrice(c.max_discount)}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
