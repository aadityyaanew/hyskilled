import { courses } from "@/data/courses";
import { categories } from "@/data/categories";
import { instructors } from "@/data/instructors";
import { PAGE_SIZE, PRICE_RANGES } from "@/lib/catalog-options";

export { PAGE_SIZE, SORT_OPTIONS, LEVELS, PRICE_RANGES } from "@/lib/catalog-options";

/**
 * Catalogue service.
 *
 * Every function is async and returns plain serialisable data so that the
 * implementation can be swapped for `backendApi.get("/courses")` without
 * touching any page or component.
 */

const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
const instructorById = new Map(instructors.map((i) => [i.id, i]));

function withRelations(course) {
  return {
    ...course,
    category: categoryBySlug.get(course.categorySlug) ?? null,
    instructor: instructorById.get(course.instructorId) ?? null,
  };
}

function toArray(v) {
  if (!v) return [];
  return (Array.isArray(v) ? v : String(v).split(",")).filter(Boolean);
}

function score(course, q) {
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const terms = needle.split(/\s+/);
  const category = categoryBySlug.get(course.categorySlug);
  const haystacks = [
    [course.title, 5],
    [course.tags.join(" "), 4],
    [category?.name ?? "", 3],
    [course.subtitle, 2],
    [course.shortDescription, 1],
  ];
  let total = 0;
  for (const term of terms) {
    let termScore = 0;
    for (const [text, weight] of haystacks) {
      if (text.toLowerCase().includes(term)) termScore += weight;
    }
    if (termScore === 0) return 0; // every term must match somewhere
    total += termScore;
  }
  return total;
}

/**
 * List courses with search, filters, sorting and pagination.
 * @param {{q?:string, category?:string|string[], level?:string|string[], price?:string,
 *          rating?:number, sort?:string, page?:number, pageSize?:number}} params
 */
export async function getCourses(params = {}) {
  const {
    q = "",
    category,
    level,
    price,
    rating,
    sort = "popular",
    page = 1,
    pageSize = PAGE_SIZE,
  } = params;

  const cats = toArray(category);
  const levels = toArray(level);
  const priceRange = PRICE_RANGES.find((r) => r.value === price);
  const minRating = Number(rating) || 0;

  let list = courses.map((c) => ({ c, s: q ? score(c, q) : 0 }));
  if (q) list = list.filter((x) => x.s > 0);

  list = list.filter(({ c }) => {
    if (cats.length && !cats.includes(c.categorySlug)) return false;
    if (levels.length && !levels.includes(c.level)) return false;
    if (priceRange && !priceRange.test(c.price)) return false;
    if (minRating && c.rating < minRating) return false;
    return true;
  });

  const sorters = {
    popular: (a, b) => b.c.learners - a.c.learners,
    rating: (a, b) => b.c.rating - a.c.rating || b.c.reviewCount - a.c.reviewCount,
    newest: (a, b) => new Date(b.c.updatedAt) - new Date(a.c.updatedAt),
    "price-asc": (a, b) => a.c.price - b.c.price,
    "price-desc": (a, b) => b.c.price - a.c.price,
  };
  list.sort(q && sort === "popular" ? (a, b) => b.s - a.s : sorters[sort] ?? sorters.popular);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const items = list
    .slice((current - 1) * pageSize, current * pageSize)
    .map(({ c }) => withRelations(c));

  return { items, total, page: current, pageSize, totalPages };
}

export async function getAllCourses() {
  return courses.map(withRelations);
}

export async function getCourseBySlug(slug) {
  const course = courses.find((c) => c.slug === slug);
  return course ? withRelations(course) : null;
}

export async function getAllCourseSlugs() {
  return courses.map((c) => c.slug);
}

export async function getFeaturedCourses(limit = 6) {
  return [...courses]
    .sort((a, b) => b.learners * b.rating - a.learners * a.rating)
    .slice(0, limit)
    .map(withRelations);
}

export async function getNewCourses(limit = 4) {
  return [...courses]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
    .map(withRelations);
}

export async function getCoursesByCategory(categorySlug, limit) {
  const list = courses.filter((c) => c.categorySlug === categorySlug).map(withRelations);
  return limit ? list.slice(0, limit) : list;
}

export async function getCoursesBySlugs(slugs) {
  return slugs
    .map((s) => courses.find((c) => c.slug === s))
    .filter(Boolean)
    .map(withRelations);
}

export async function getRelatedCourses(course, limit = 3) {
  return courses
    .filter((c) => c.slug !== course.slug)
    .map((c) => ({
      c,
      s:
        (c.categorySlug === course.categorySlug ? 10 : 0) +
        c.tags.filter((t) => course.tags.includes(t)).length * 2 +
        c.rating,
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ c }) => withRelations(c));
}

/** Lightweight results for the global search dialog. */
export async function searchCourses(q, limit = 6) {
  if (!q || q.trim().length < 2) return [];
  return courses
    .map((c) => ({ c, s: score(c, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ c }) => {
      const full = withRelations(c);
      return {
        slug: full.slug,
        title: full.title,
        price: full.price,
        originalPrice: full.originalPrice,
        level: full.level,
        categorySlug: full.categorySlug,
        categoryName: full.category?.short,
        rating: full.rating,
      };
    });
}

export async function getInstructors(limit) {
  return limit ? instructors.slice(0, limit) : instructors;
}

