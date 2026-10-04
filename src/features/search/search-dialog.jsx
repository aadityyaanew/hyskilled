"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, SearchX, Zap, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { searchCoursesClient } from "@/services/client/catalog.client";

import { formatPrice } from "@/lib/format";
import { ROUTES } from "@/config/routes";

const POPULAR = ["Generative AI", "Python", "Machine Learning", "Figma", "Next.js", "SQL"];

/** Global course search (⌘/Ctrl + K) backed by /api/search. */
export function SearchDialog({ open, onOpenChange }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 220);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    searchCoursesClient(debounced, { signal: controller.signal })
      .then((r) => {
        setResults(r);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setLoading(false);
      });
    return () => controller.abort();
  }, [debounced]);

  function go(href) {
    onOpenChange(false);
    router.push(href);
  }

  function submit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    go(`${ROUTES.courses}?q=${encodeURIComponent(query.trim())}`);
  }

  const hasQuery = debounced.trim().length >= 2;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setQuery("");
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="top-[12%] w-[calc(100%-1.5rem)] max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">Search courses</DialogTitle>
        <DialogDescription className="sr-only">
          Search the Hyskilled catalogue by topic, tool or skill.
        </DialogDescription>

        <form onSubmit={submit} className="flex items-center gap-3 border-b px-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, e.g. “machine learning”"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            aria-label="Search courses"
            autoComplete="off"
          />
          <kbd className="hidden shrink-0 rounded-md border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground sm:block">
            ESC
          </kbd>
        </form>

        <div className="max-h-[60vh] overflow-y-auto p-2" aria-live="polite">
          {!hasQuery && (
            <div className="p-3">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <TrendingUp className="size-3.5" /> Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    onClick={() => go(`${ROUTES.courses}?q=${encodeURIComponent(term)}`)}
                    className="focus-ring cursor-pointer rounded-full border bg-background px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasQuery && loading && results.length === 0 && (
            <div className="space-y-2 p-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-shimmer h-14 rounded-xl" />
              ))}
            </div>
          )}

          {hasQuery && !loading && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <SearchX className="size-8 text-muted-foreground" />
              <p className="font-semibold text-ink">No courses found for “{debounced}”</p>
              <p className="text-sm text-muted-foreground">Try a different keyword or browse all courses.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => go(ROUTES.courses)}>
                Browse all courses
              </Button>
            </div>
          )}

          {results.length > 0 && (
            <ul>
              {results.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={ROUTES.course(r.slug)}
                    onClick={() => onOpenChange(false)}
                    className="focus-ring group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-brand-50"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                      <Zap className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink group-hover:text-brand-800">
                        {r.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{r.categoryName}</span>·<span>{r.level}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-ink">{formatPrice(r.price)}</span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t p-1 pt-2">
                <button
                  onClick={() => go(`${ROUTES.courses}?q=${encodeURIComponent(debounced)}`)}
                  className="focus-ring flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-primary hover:bg-brand-50"
                >
                  See all results for “{debounced}”
                  <ArrowRight className="size-4" />
                </button>
              </li>
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
