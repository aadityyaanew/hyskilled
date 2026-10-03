import { notFound } from "next/navigation";
import { CourseForm } from "@/features/admin/course-form";
import { getAdminCategories } from "@/services/admin.service";
import { query, isDbConfigured } from "@/lib/db";
import { courses as mockCourses } from "@/data/courses";
import { safeJsonParse } from "@/lib/admin-api";

export const metadata = {
  title: "Edit Course | Admin",
};

export default async function EditCoursePage({ params }) {
  const { id } = await params;
  const categories = await getAdminCategories();

  let course = null;

  if (isDbConfigured()) {
    try {
      const isNumeric = /^\d+$/.test(id);
      const sql = isNumeric
        ? `SELECT c.*, cat.slug as category_slug, cat.name as category_name
           FROM courses c
           LEFT JOIN categories cat ON cat.id = c.category_id
           WHERE c.id = ? LIMIT 1`
        : `SELECT c.*, cat.slug as category_slug, cat.name as category_name
           FROM courses c
           LEFT JOIN categories cat ON cat.id = c.category_id
           WHERE c.slug = ? LIMIT 1`;

      const rows = await query(sql, [isNumeric ? Number(id) : id]);
      if (rows && rows.length > 0) {
        course = rows[0];
        course.price = Number(course.price);
        course.original_price = course.original_price ? Number(course.original_price) : null;
        course.tags = safeJsonParse(course.tags, []);
        course.outcomes = safeJsonParse(course.outcomes, []);
        course.requirements = safeJsonParse(course.requirements, []);
        course.audience = safeJsonParse(course.audience, []);
        course.modules = safeJsonParse(course.modules, []);
      }
    } catch (err) {
      console.error("Error fetching course for edit:", err);
    }
  }

  if (!course) {
    const foundMock = mockCourses.find((c) => c.slug === id);
    if (foundMock) {
      course = {
        ...foundMock,
        id: foundMock.slug,
        category_slug: foundMock.categorySlug,
      };
    }
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Edit Course
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Update course curriculum, pricing, category, and metadata for "{course.title}".
        </p>
      </div>

      <CourseForm course={course} categories={categories} />
    </div>
  );
}
