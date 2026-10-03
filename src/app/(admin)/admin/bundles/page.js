import { Package, Check } from "lucide-react";
import { getBundles } from "@/services/bundles.service";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Career Bundles | Admin",
};

export default async function AdminBundlesPage() {
  const bundles = await getBundles();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Career-Track Bundles
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Bundled learning tracks with automatic multi-course discount calculations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <div
            key={bundle.slug}
            className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="size-5" />
                </span>
                {bundle.highlight && (
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                    Featured
                  </span>
                )}
              </div>

              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
                {bundle.name}
              </h2>
              <p className="text-xs text-muted-foreground">{bundle.tagline}</p>

              <div className="mt-4 rounded-2xl bg-muted/40 p-3.5 space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Included Courses ({bundle.courses?.length || 0})
                </p>
                {bundle.courses?.map((c) => (
                  <p key={c.slug} className="flex items-center gap-1.5 text-xs text-foreground">
                    <Check className="size-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
              <div>
                <p className="font-heading text-xl font-bold text-foreground">
                  {formatPrice(bundle.price)}
                </p>
                {bundle.originalPrice && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatPrice(bundle.originalPrice)}
                  </p>
                )}
              </div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Save {formatPrice(bundle.savings)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
