import { NextResponse } from "next/server";
import { requireAdmin, slugify, safeJsonParse } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";

export async function GET(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);
    const sql = isNumeric
      ? `SELECT c.*, cat.name as category_name, cat.slug as category_slug
         FROM courses c
         LEFT JOIN categories cat ON cat.id = c.category_id
         WHERE c.id = ? LIMIT 1`
      : `SELECT c.*, cat.name as category_name, cat.slug as category_slug
         FROM courses c
         LEFT JOIN categories cat ON cat.id = c.category_id
         WHERE c.slug = ? LIMIT 1`;

    const rows = await query(sql, [isNumeric ? Number(id) : id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const course = rows[0];
    course.tags = safeJsonParse(course.tags, []);
    course.outcomes = safeJsonParse(course.outcomes, []);
    course.requirements = safeJsonParse(course.requirements, []);
    course.audience = safeJsonParse(course.audience, []);
    course.modules = safeJsonParse(course.modules, []);

    return NextResponse.json({ success: true, course });
  } catch (err) {
    console.error("Database error fetching course:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch course." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const {
    title,
    subtitle = "",
    categoryId: providedCategoryId,
    categorySlug,
    instructorId = null,
    level = "Beginner",
    durationHours = 20,
    price = 0,
    originalPrice = null,
    badge = null,
    tags = [],
    shortDescription = "",
    description = "",
    outcomes = [],
    requirements = [],
    audience = [],
    modules = [],
    status = "published",
    appCourseId = null,
  } = body;

  if (!title || !title.trim()) {
    return NextResponse.json({ success: false, message: "Course title is required." }, { status: 422 });
  }

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT id, slug FROM courses WHERE id = ? LIMIT 1" : "SELECT id, slug FROM courses WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const targetCourseId = existing[0].id;
    const currentSlug = existing[0].slug;
    const newSlug = body.slug ? slugify(body.slug) : (body.title ? slugify(body.title) : currentSlug);

    // If slug changed, ensure new slug is unique
    if (newSlug !== currentSlug) {
      const slugConflict = await query("SELECT id FROM courses WHERE slug = ? AND id != ? LIMIT 1", [
        newSlug,
        targetCourseId,
      ]);
      if (slugConflict.length > 0) {
        return NextResponse.json(
          { success: false, message: `A course with slug "${newSlug}" already exists.` },
          { status: 409 }
        );
      }
    }

    // Resolve category id
    let targetCatId = providedCategoryId ? Number(providedCategoryId) : null;
    if (!targetCatId && categorySlug) {
      const catRows = await query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [categorySlug]);
      targetCatId = catRows[0]?.id;
    }
    if (!targetCatId) {
      const firstCat = await query("SELECT id FROM categories ORDER BY id ASC LIMIT 1");
      targetCatId = firstCat[0]?.id || 1;
    }

    await execute(
      `UPDATE courses SET
        slug = ?,
        title = ?,
        subtitle = ?,
        category_id = ?,
        instructor_id = ?,
        level = ?,
        duration_hours = ?,
        price = ?,
        original_price = ?,
        badge = ?,
        tags = ?,
        short_description = ?,
        description = ?,
        outcomes = ?,
        requirements = ?,
        audience = ?,
        modules = ?,
        status = ?,
        app_course_id = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        newSlug,
        title.trim(),
        subtitle?.trim() || null,
        targetCatId,
        instructorId || null,
        level,
        Number(durationHours) || 0,
        Number(price) || 0,
        originalPrice ? Number(originalPrice) : null,
        badge?.trim() || null,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        shortDescription?.trim() || null,
        description?.trim() || null,
        JSON.stringify(Array.isArray(outcomes) ? outcomes : []),
        JSON.stringify(Array.isArray(requirements) ? requirements : []),
        JSON.stringify(Array.isArray(audience) ? audience : []),
        JSON.stringify(Array.isArray(modules) ? modules : []),
        status || "published",
        appCourseId?.trim() || newSlug,
        targetCourseId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Course updated successfully!",
      id: targetCourseId,
      slug: newSlug,
    });
  } catch (err) {
    console.error("Database error updating course:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update course." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT id, title FROM courses WHERE id = ? LIMIT 1" : "SELECT id, title FROM courses WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const courseId = existing[0].id;
    const courseTitle = existing[0].title;

    await execute("DELETE FROM courses WHERE id = ?", [courseId]);

    return NextResponse.json({
      success: true,
      message: `Course "${courseTitle}" deleted successfully.`,
      id: courseId,
    });
  } catch (err) {
    console.error("Database error deleting course:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete course." },
      { status: 500 }
    );
  }
}
