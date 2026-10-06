import Link from "next/link";
import { BarChart2, Clock, Layers, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CourseCover } from "@/features/courses/course-cover";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { PriceDisplay } from "@/components/shared/price-display";
import { CourseCountdown } from "@/components/shared/course-countdown";

import { courseToLineItem } from "@/lib/line-items";
import { formatCompact, formatHours } from "@/lib/format";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const badgeStyles = {
  Bestseller: "bg-amber-400 text-amber-950 border-transparent",
  New: "bg-emerald-500 text-white border-transparent",
  Popular: "bg-white text-brand-800 border-transparent",
};

/** Catalogue card. The whole card is clickable via a stretched title link. */
export function CourseCard({ course, className, priority = false }) {
  return (
    <article
      className={cn(
        "group/cover relative flex flex-col overflow-hidden rounded-3xl border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift focus-within:ring-3 focus-within:ring-ring/40",
        className
      )}
    >
      <div className="relative">
        <CourseCover course={course} className="aspect-[16/10] w-full" />
        {course.badge && !course.isClosed && (
          <Badge className={cn("absolute top-3 right-3 shadow-sm", badgeStyles[course.badge])}>
            {course.badge}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {(course.closingTimerEnabled || course.isClosed) && (
          <div className="mb-3">
            <CourseCountdown
              closingDate={course.closingDate}
              closingTimerEnabled={course.closingTimerEnabled}
              isClosed={course.isClosed}
              variant="card"
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-primary">{course.category?.short}</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <BarChart2 className="size-3.5" />
            {course.level}
          </span>
        </div>

        <h3 className="mt-2 text-lg leading-snug font-bold text-ink">
          <Link
            href={ROUTES.course(course.slug)}
            prefetch={priority ? true : undefined}
            className="outline-none after:absolute after:inset-0 after:z-0 after:content-[''] group-hover/cover:text-brand-800"
          >
            {course.title}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.shortDescription}</p>



        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {formatHours(course.durationHours)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-3.5" />
            {course.moduleCount} modules
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" />
            {formatCompact(course.learners)} learners
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t pt-4">
            <PriceDisplay price={course.price} originalPrice={course.originalPrice} size="sm" showDiscount={false} />
            <div className="relative z-10">
              <AddToCartButton item={courseToLineItem(course)} size="sm" variant="secondary" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border bg-card">
      <div className="skeleton-shimmer aspect-[16/10]" />
      <div className="space-y-3 p-5">
        <div className="skeleton-shimmer h-3 w-1/3 rounded" />
        <div className="skeleton-shimmer h-5 w-5/6 rounded" />
        <div className="skeleton-shimmer h-4 w-full rounded" />
        <div className="skeleton-shimmer h-4 w-2/3 rounded" />
        <div className="skeleton-shimmer mt-6 h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}
