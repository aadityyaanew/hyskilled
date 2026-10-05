import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CatalogView } from "@/features/courses/catalog-view";
import { CategoryIcon } from "@/features/categories/category-icon";
import { CtaBanner } from "@/features/marketing/cta-banner";
import {
  getAllCategorySlugs,
  getCategories,
  getCategoryBySlug,
} from "@/services/categories.service";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return buildMetadata({
    title: `${category.name} Courses`,
    description: category.description,
    path: ROUTES.category(slug),
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const [category, categories, query] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    searchParams,
  ]);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        eyebrow={`${category.courseCount} ${category.courseCount === 1 ? "course" : "courses"}`}
        title={category.name}
        description={category.description}
        breadcrumbs={[
          { label: "Categories", href: ROUTES.categories },
          { label: category.short, href: ROUTES.category(slug) },
        ]}
      >
        <ul className="mt-6 flex flex-wrap gap-2">
          {category.keywords.map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-1.5 text-sm font-medium text-ink-soft">
              <CategoryIcon name={category.icon} className="size-3.5 text-primary" />
              {k}
            </li>
          ))}
        </ul>
      </PageHeader>
      <CatalogView
        searchParams={query}
        basePath={ROUTES.category(slug)}
        categories={categories}
        fixedCategory={slug}
      />
      <CtaBanner />
    </>
  );
}
