import { Suspense } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard, CourseCardSkeleton } from "@/features/courses/course-card";
import {
  ActiveFilters,
  CatalogToolbar,
  FilterPanel,
  PendingOverlay,
} from "@/features/courses/catalog-controls";
import { CatalogPagination } from "@/features/courses/catalog-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { getCourses } from "@/services/courses.service";
import { pluralize } from "@/lib/format";

/**
 * Shared catalogue UI for /courses and /categories/[slug].
 * Results are fetched on the server from URL params; the client controls only
 * edit the URL.
 */
export async function CatalogView({ searchParams, basePath, categories, fixedCategory }) {
  const result = await getCourses({
    ...searchParams,
    category: fixedCategory ?? searchParams.category,
    page: searchParams.page,
  });
  const hideCategories = Boolean(fixedCategory);

  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[17rem_1fr] lg:py-14">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-28 rounded-3xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">Filters</h2>
          </div>
          <Suspense fallback={<div className="skeleton-shimmer h-96 rounded-2xl" />}>
            <FilterPanel categories={categories} hideCategories={hideCategories} idPrefix="d" />
          </Suspense>
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <Suspense fallback={<div className="skeleton-shimmer h-12 rounded-xl" />}>
          <CatalogToolbar total={result.total} categories={categories} hideCategories={hideCategories} />
        </Suspense>

        <Suspense fallback={null}>
          <ActiveFilters categories={categories} />
        </Suspense>

        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          Showing <span className="font-semibold text-ink">{result.items.length}</span> of{" "}
          <span className="font-semibold text-ink">{pluralize(result.total, "course")}</span>
          {searchParams.q && (
            <>
              {" "}
              for “<span className="font-semibold text-ink">{searchParams.q}</span>”
            </>
          )}
        </p>

        <Suspense
          fallback={
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <PendingOverlay>
            {result.items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((course, i) => (
                  <CourseCard key={course.slug} course={course} priority={i < 3} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={SearchX}
                title="No courses match your filters"
                description="Try removing a filter or searching for something broader like “Python” or “Design”."
                action={
                  <Button asChild>
                    <Link href={basePath}>Reset filters</Link>
                  </Button>
                }
              />
            )}
          </PendingOverlay>
        </Suspense>

        <CatalogPagination
          page={result.page}
          totalPages={result.totalPages}
          basePath={basePath}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
}
