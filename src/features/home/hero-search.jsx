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
        className="flex items-center gap-2 rounded-2xl border bg-white p-1.5 shadow-lift transition-shadow focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100"
      >
        <Search className="ml-3 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor="hero-search" className="sr-only">
          Search courses
        </label>
        <input
          id="hero-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to learn? e.g. Machine Learning"
          className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          autoComplete="off"
        />
        <Button type="submit" variant="brand" size="lg" className="shrink-0">
          Search
        </Button>
      </form>
      {suggestions.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">Popular:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => router.push(`${ROUTES.courses}?q=${encodeURIComponent(s)}`)}
              className="focus-ring cursor-pointer rounded-full border bg-white/70 px-3 py-1 font-medium text-ink-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            >
              {s}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}
