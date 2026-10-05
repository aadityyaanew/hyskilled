import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function buildHref(basePath, searchParams, page) {
  const p = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v && k !== "page") p.set(k, Array.isArray(v) ? v.join(",") : v);
  });
  if (page > 1) p.set("page", String(page));
  const qs = p.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

/** Server-rendered, crawlable pagination. */
export function CatalogPagination({ page, totalPages, basePath, searchParams }) {
  if (totalPages <= 1) return null;
  const itemBase =
    "focus-ring inline-flex size-8.5 sm:size-10 items-center justify-center rounded-lg sm:rounded-xl border text-xs sm:text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
      {page > 1 ? (
        <Link href={buildHref(basePath, searchParams, page - 1)} rel="prev" className={cn(itemBase, "hover:border-brand-300 hover:bg-brand-50")} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemBase, "pointer-events-none opacity-40")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-1 text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, searchParams, p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={cn(
              itemBase,
              p === page
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-brand-700/20"
                : "hover:border-brand-300 hover:bg-brand-50"
            )}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={buildHref(basePath, searchParams, page + 1)} rel="next" className={cn(itemBase, "hover:border-brand-300 hover:bg-brand-50")} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemBase, "pointer-events-none opacity-40")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
