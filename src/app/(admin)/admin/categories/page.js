import { FolderTree, Tag } from "lucide-react";
import { getAdminCategories } from "@/services/admin.service";
import { CategoryIcon } from "@/features/categories/category-icon";

export const metadata = {
  title: "Categories Management | Admin",
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Course Categories
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Browse technology categories mapped to storefront filtering and navigation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.slug}
            className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <CategoryIcon name={cat.icon || "Code2"} className="size-5" />
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {cat.course_count || 0} courses
                </span>
              </div>

              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
                {cat.name}
              </h2>
              <p className="mt-1 font-mono text-xs text-primary">/{cat.slug}</p>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {cat.description}
              </p>
            </div>

            {cat.keywords && (
              <div className="mt-4 flex flex-wrap gap-1 border-t border-border/60 pt-3">
                {(Array.isArray(cat.keywords)
                  ? cat.keywords
                  : JSON.parse(cat.keywords || "[]")
                ).map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    <Tag className="size-2.5 text-primary" /> {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
