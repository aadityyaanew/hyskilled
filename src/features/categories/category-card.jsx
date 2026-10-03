import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "@/features/categories/category-icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function CategoryCard({ category, className }) {
  return (
    <Link
      href={ROUTES.category(category.slug)}
      className={cn(
        "focus-ring group relative flex flex-col overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 size-40 rounded-full bg-brand-100/70 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between">
        <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 text-primary transition-all duration-300 group-hover:from-brand-500 group-hover:to-brand-700 group-hover:text-white group-hover:shadow-glow">
          <CategoryIcon name={category.icon} className="size-7" />
        </span>
        <span className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-white">
          <ArrowUpRight className="size-4 transition-transform group-hover:rotate-12" />
        </span>
      </div>
      <h3 className="relative mt-5 text-lg font-bold text-ink">{category.name}</h3>
      <p className="relative mt-1.5 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
      <p className="relative mt-4 text-xs font-bold tracking-wide text-primary uppercase">
        {category.courseCount} {category.courseCount === 1 ? "course" : "courses"}
      </p>
    </Link>
  );
}
