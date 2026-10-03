"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/features/courses/course-card";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes";

/**
 * Homepage course rail with category tabs. The full dataset is passed from the
 * server component; tabs filter client-side (instant, no request).
 */
export function FeaturedCourses({ courses, categories }) {
  const [active, setActive] = useState("all");
  const tabs = [{ slug: "all", short: "All" }, ...categories.filter((c) => courses.some((x) => x.categorySlug === c.slug))];
  const visible = (active === "all" ? courses : courses.filter((c) => c.categorySlug === active)).slice(0, 6);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter featured courses by category"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
      >
        {tabs.map((t) => (
          <button
            key={t.slug}
            role="tab"
            aria-selected={active === t.slug}
            onClick={() => setActive(t.slug)}
            className={cn(
              "focus-ring shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              active === t.slug
                ? "border-primary bg-primary text-primary-foreground shadow-md shadow-brand-700/20"
                : "bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
            )}
          >
            {t.short}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        key={active}
        className="mt-10 grid animate-fade-up gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((course, i) => (
          <CourseCard key={course.slug} course={course} priority={i < 3} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg" variant="outline">
          <Link href={active === "all" ? ROUTES.courses : ROUTES.category(active)}>
            {active === "all" ? "View all courses" : "View all in this category"} <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
