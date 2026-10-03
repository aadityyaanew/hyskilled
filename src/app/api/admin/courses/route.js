import { NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";

export async function GET(request) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("categoryId");
  const status = searchParams.get("status");

  try {
    let sql = `
      SELECT c.*, cat.name as category_name, cat.slug as category_slug
      FROM courses c
      LEFT JOIN categories cat ON cat.id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    if (q.trim()) {
      sql += ` AND (c.title LIKE ? OR c.slug LIKE ? OR c.description LIKE ?)`;
      const searchPattern = `%${q.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (categoryId) {
      sql += ` AND c.category_id = ?`;
      params.push(Number(categoryId));
    }

    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const courses = await query(sql, params);
    return NextResponse.json({ success: true, courses });
  } catch (err) {
    console.error("Database error fetching admin courses:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch courses." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    title,
    subtitle = "",
    categorySlug,
    categoryId: providedCategoryId,
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

  const slug = body.slug ? slugify(body.slug) : slugify(title);

  try {
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

    // Check slug uniqueness
    const existing = await query("SELECT id FROM courses WHERE slug = ? LIMIT 1", [slug]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `A course with slug "${slug}" already exists. Please choose a different title or slug.` },
        { status: 409 }
      );
    }

    const result = await execute(
      `INSERT INTO courses (
        slug, title, subtitle, category_id, instructor_id, level, duration_hours,
        price, original_price, badge, tags, short_description, description,
        outcomes, requirements, audience, modules, status, app_course_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
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
        appCourseId?.trim() || slug,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Course created successfully!",
      id: result.insertId,
      slug,
    });
  } catch (err) {
    console.error("Database error creating course:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create course." },
      { status: 500 }
    );
  }
}
