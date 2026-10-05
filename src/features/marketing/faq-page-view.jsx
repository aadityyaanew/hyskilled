"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MessageSquare, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/features/marketing/faq-section";
import { EmptyState } from "@/components/shared/empty-state";
import { ROUTES } from "@/config/routes";

export function FaqPageView({ initialFaqs, groups }) {
  const [activeGroup, setActiveGroup] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return initialFaqs.filter((f) => {
      const matchesGroup = activeGroup === "all" || f.group === activeGroup;
      if (!matchesGroup) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    });
  }, [initialFaqs, activeGroup, query]);

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions (e.g., refund, app, invoice)..."
            className="pl-10 h-11"
          />
        </div>

        <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full sm:w-auto">
          <TabsList className="h-auto p-1 rounded-2xl flex max-w-full overflow-x-auto no-scrollbar gap-1 sm:flex-wrap">
            <TabsTrigger value="all" className="rounded-xl px-3.5 py-2 text-xs sm:text-sm shrink-0">
              All
            </TabsTrigger>
            {groups.map((g) => (
              <TabsTrigger
                key={g.id}
                value={g.id}
                className="rounded-xl px-3.5 py-2 text-xs sm:text-sm shrink-0"
              >
                {g.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Accordion or Empty */}
      {filtered.length > 0 ? (
        <div className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <FaqAccordion faqs={filtered} />
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No questions match your search"
          description="Try different keywords or browse our categories above."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setActiveGroup("all");
              }}
            >
              Reset filters
            </Button>
          }
        />
      )}

      {/* Still need help callout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-brand-200 bg-brand-50/50 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white">
            <MessageSquare className="size-6" />
          </span>
          <div>
            <h3 className="font-heading font-bold text-ink text-lg">Still have questions?</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Can't find what you're looking for? Our support team is happy to help.
            </p>
          </div>
        </div>
        <Button asChild variant="brand" size="lg">
          <Link href={ROUTES.contact}>
            Contact support <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
