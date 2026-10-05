/**
 * Normalised "line item" used by the cart, checkout and orders.
 * Keeping one shape for courses and bundles means the cart/checkout code never
 * needs to care what is being sold – new product types (e.g. gift cards,
 * live cohorts) only need a new mapper here.
 */

export function courseToLineItem(course) {
  return {
    id: `course:${course.slug}`,
    type: "course",
    slug: course.slug,
    title: course.title,
    subtitle: `${course.level} · ${course.durationHours} hrs`,
    price: course.price,
    originalPrice: course.originalPrice,
    categorySlug: course.categorySlug,
    imageUrl: course.imageUrl || course.image_url || null,
    isClosed: Boolean(course.isClosed),
  };
}

export function bundleToLineItem(bundle) {
  return {
    id: `bundle:${bundle.slug}`,
    type: "bundle",
    slug: bundle.slug,
    title: bundle.name,
    subtitle: `${bundle.courses.length} courses · ${bundle.totalHours} hrs`,
    price: bundle.price,
    originalPrice: bundle.originalPrice,
    categorySlug: bundle.categorySlugs?.[0] ?? null,
  };
}

export function lineItemHref(item) {
  return item.type === "bundle" ? "/pricing" : `/courses/${item.slug}`;
}
