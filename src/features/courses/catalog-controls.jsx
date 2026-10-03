"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RatingStars } from "@/components/shared/rating-stars";
import { useCatalogParams } from "@/features/courses/use-catalog-params";
import { useDebounce } from "@/hooks/use-debounce";
import { LEVELS, PRICE_RANGES, SORT_OPTIONS } from "@/lib/catalog-options";

/* ───────────── filter groups ───────────── */

function FilterGroup({ title, children }) {
  return (
    <fieldset className="border-b py-5 first:pt-0 last:border-b-0">
      <legend className="mb-3 text-sm font-bold text-ink">{title}</legend>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function CheckRow({ id, checked, onChange, children, count }) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="flex-1 cursor-pointer text-sm font-medium text-ink-soft">
        {children}
      </Label>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </div>
  );
}

/** Rendered inside the desktop sidebar and the mobile filter sheet. */
export function FilterPanel({ categories, hideCategories = false, idPrefix = "f" }) {
  const params = useCatalogParams();
  const selectedCats = params.getAll("category");
  const selectedLevels = params.getAll("level");
  const price = params.get("price");
  const rating = params.get("rating");

  return (
    <div>
      {!hideCategories && (
        <FilterGroup title="Category">
          {categories.map((c) => (
            <CheckRow
              key={c.slug}
              id={`${idPrefix}-cat-${c.slug}`}
              checked={selectedCats.includes(c.slug)}
              onChange={() => params.toggle("category", c.slug)}
              count={c.courseCount}
            >
              {c.short}
            </CheckRow>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Level">
        {LEVELS.map((l) => (
          <CheckRow
            key={l}
            id={`${idPrefix}-lvl-${l}`}
            checked={selectedLevels.includes(l)}
            onChange={() => params.toggle("level", l)}
          >
            {l}
          </CheckRow>
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <RadioGroup value={price} onValueChange={(v) => params.set("price", v === price ? "" : v)}>
          {PRICE_RANGES.map((r) => (
            <div key={r.value} className="flex items-center gap-2.5">
              <RadioGroupItem
                value={r.value}
                id={`${idPrefix}-price-${r.value}`}
                onClick={() => price === r.value && params.set("price", "")}
              />
              <Label htmlFor={`${idPrefix}-price-${r.value}`} className="cursor-pointer text-sm font-medium text-ink-soft">
                {r.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterGroup>

      <FilterGroup title="Rating">
        <RadioGroup value={rating} onValueChange={(v) => params.set("rating", v === rating ? "" : v)}>
          {["4.8", "4.5", "4"].map((r) => (
            <div key={r} className="flex items-center gap-2.5">
              <RadioGroupItem
                value={r}
                id={`${idPrefix}-rating-${r}`}
                onClick={() => rating === r && params.set("rating", "")}
              />
              <Label htmlFor={`${idPrefix}-rating-${r}`} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink-soft">
                <RatingStars value={Number(r)} size={13} /> {r} &amp; up
              </Label>
            </div>
          ))}
        </RadioGroup>
      </FilterGroup>
    </div>
  );
}

/* ───────────── toolbar: search + sort + mobile filters ───────────── */

export function CatalogToolbar({ total, categories, hideCategories }) {
  const params = useCatalogParams();
  const [q, setQ] = useState(params.get("q"));
  const debounced = useDebounce(q, 350);
  const [sheetOpen, setSheetOpen] = useState(false);

  // push debounced search into the URL
  useEffect(() => {
    if (debounced !== params.get("q")) params.set("q", debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // keep input in sync when the URL changes elsewhere (e.g. "clear all")
  const urlQ = params.get("q");
  useEffect(() => setQ(urlQ), [urlQ]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="catalog-search" className="sr-only">
            Search courses
          </label>
          <input
            id="catalog-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by topic, tool or skill…"
            className="h-12 w-full rounded-xl border bg-white pr-10 pl-10 text-[15px] shadow-sm transition-all outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
          />
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            {params.isPending ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              q && (
                <button
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                  className="focus-ring grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              )
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="flex-1 lg:hidden" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal />
            Filters
            {params.activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] text-white">
                {params.activeCount}
              </span>
            )}
          </Button>

          <Select value={params.get("sort") || "popular"} onValueChange={(v) => params.set("sort", v === "popular" ? "" : v)}>
            <SelectTrigger aria-label="Sort courses" className="h-12! w-full min-w-48 flex-1 rounded-xl sm:w-52 sm:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-[90%] gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-b p-5">
            <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
            <SheetDescription>Refine the course list.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-5">
            <FilterPanel categories={categories} hideCategories={hideCategories} idPrefix="m" />
          </div>
          <SheetFooter className="flex-row gap-3 border-t p-4">
            <Button variant="outline" className="flex-1" onClick={() => params.clear(["category", "level", "price", "rating"])}>
              Clear all
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Show {total} {total === 1 ? "course" : "courses"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ───────────── active filter chips ───────────── */

export function ActiveFilters({ categories }) {
  const params = useCatalogParams();
  const chips = [
    ...params.getAll("category").map((slug) => ({
      key: `c-${slug}`,
      label: categories.find((c) => c.slug === slug)?.short ?? slug,
      remove: () => params.toggle("category", slug),
    })),
    ...params.getAll("level").map((l) => ({ key: `l-${l}`, label: l, remove: () => params.toggle("level", l) })),
    ...(params.get("price")
      ? [{
          key: "price",
          label: PRICE_RANGES.find((r) => r.value === params.get("price"))?.label ?? "Price",
          remove: () => params.set("price", ""),
        }]
      : []),
    ...(params.get("rating")
      ? [{ key: "rating", label: `${params.get("rating")}★ & up`, remove: () => params.set("rating", "") }]
      : []),
    ...(params.get("q")
      ? [{ key: "q", label: `“${params.get("q")}”`, remove: () => params.set("q", "") }]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={c.remove}
          className="focus-ring inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pr-2 pl-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-100"
          aria-label={`Remove filter ${c.label}`}
        >
          {c.label}
          <X className="size-3.5" />
        </button>
      ))}
      <button
        onClick={() => params.clear()}
        className="focus-ring cursor-pointer rounded px-2 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

/** Dim the results while a navigation is pending. */
export function PendingOverlay({ children }) {
  const params = useCatalogParams();
  return (
    <div className={params.isPending ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"} aria-busy={params.isPending}>
      {children}
    </div>
  );
}
