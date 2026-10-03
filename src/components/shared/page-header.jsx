import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

/** Visual breadcrumbs + BreadcrumbList structured data. */
export function Breadcrumbs({ items, tone = "light", className }) {
  const all = [{ label: "Home", href: ROUTES.home }, ...items];
  const dark = tone === "dark";
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <JsonLd data={breadcrumbJsonLd(all)} />
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {all.map((item, i) => {
          const last = i === all.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {last ? (
                <span
                  aria-current="page"
                  className={cn("font-medium", dark ? "text-white" : "text-ink")}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "focus-ring inline-flex items-center gap-1 rounded transition-colors",
                    dark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {i === 0 && <Home className="size-3.5" />}
                  {i !== 0 && item.label}
                  {i === 0 && <span className="sr-only">Home</span>}
                </Link>
              )}
              {!last && (
                <ChevronRight className={cn("size-3.5", dark ? "text-white/30" : "text-muted-foreground/50")} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Standard inner-page banner. */
export function PageHeader({ eyebrow, title, description, breadcrumbs, children, className }) {
  return (
    <section className={cn("relative overflow-hidden border-b bg-brand-50/50", className)}>
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-brand-200/50 blur-3xl"
      />
      <div className="container-page relative py-10 sm:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-5" />}
        {eyebrow && (
          <p className="mb-2 text-xs font-bold tracking-[0.14em] text-primary uppercase">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}
