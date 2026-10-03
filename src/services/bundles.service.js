import { bundles } from "@/data/bundles";
import { courses } from "@/data/courses";
import { categories } from "@/data/categories";

function enrich(bundle) {
  const included = bundle.courseSlugs
    .map((slug) => courses.find((c) => c.slug === slug))
    .filter(Boolean);
  const originalPrice = included.reduce((sum, c) => sum + c.price, 0);
  return {
    ...bundle,
    courses: included.map((c) => ({
      slug: c.slug,
      title: c.title,
      price: c.price,
      durationHours: c.durationHours,
      level: c.level,
      categorySlug: c.categorySlug,
    })),
    categorySlugs: [...new Set(included.map((c) => c.categorySlug))],
    categoryNames: [
      ...new Set(
        included.map((c) => categories.find((x) => x.slug === c.categorySlug)?.short)
      ),
    ],
    originalPrice,
    totalHours: included.reduce((sum, c) => sum + c.durationHours, 0),
    savings: originalPrice - bundle.price,
  };
}

export async function getBundles() {
  return bundles.map(enrich);
}

export async function getBundleBySlug(slug) {
  const bundle = bundles.find((b) => b.slug === slug);
  return bundle ? enrich(bundle) : null;
}
