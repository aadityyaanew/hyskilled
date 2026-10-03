import { categories } from "@/data/categories";
import { courses } from "@/data/courses";

function withCount(category) {
  return {
    ...category,
    courseCount: courses.filter((c) => c.categorySlug === category.slug).length,
  };
}

export async function getCategories() {
  return categories.map(withCount);
}

export async function getCategoryBySlug(slug) {
  const category = categories.find((c) => c.slug === slug);
  return category ? withCount(category) : null;
}

export async function getAllCategorySlugs() {
  return categories.map((c) => c.slug);
}
