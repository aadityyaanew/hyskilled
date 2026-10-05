"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

/** Big hero search – routes to the catalogue with ?q= */
export function HeroSearch({ suggestions = [] }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `${ROUTES.courses}?q=${encodeURIComponent(term)}` : ROUTES.courses);
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        role="search"
        className="flex items-center gap-1.5 sm:gap-2 rounded-2xl border bg-white p-1 sm:p-1.5 shadow-lift transition-shadow focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
      >
        <Search className="ml-2.5 sm:ml-3 size-4 sm:size-5 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="hero-search" className="sr-only">
          Search courses
        </label>
        <input
          id="hero-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search e.g. Machine Learning, Python..."
          className="h-10 sm:h-12 min-w-0 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground"
          autoComplete="off"
        />
        <Button type="submit" variant="brand" className="shrink-0 h-9 sm:h-11 px-3.5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold">
          Search
        </Button>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs sm:text-sm text-muted-foreground sm:flex-wrap">
          <span className="font-semibold text-ink-soft shrink-0">Popular:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => router.push(`${ROUTES.courses}?q=${encodeURIComponent(s)}`)}
              className="focus-ring shrink-0 cursor-pointer rounded-full border bg-white/80 px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
