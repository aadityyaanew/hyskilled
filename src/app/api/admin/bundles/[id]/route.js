import { NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-api";
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
      ? `SELECT * FROM bundles WHERE id = ? LIMIT 1`
      : `SELECT * FROM bundles WHERE slug = ? LIMIT 1`;

    const rows = await query(sql, [isNumeric ? Number(id) : id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Bundle not found." }, { status: 404 });
    }

    const bundle = rows[0];
    bundle.price = Number(bundle.price);
    bundle.highlight = Boolean(bundle.highlight);

    const courses = await query(
      `SELECT bc.sort_order, c.id, c.slug, c.title, c.price, c.duration_hours, c.level
       FROM bundle_courses bc
       JOIN courses c ON c.id = bc.course_id
       WHERE bc.bundle_id = ?
       ORDER BY bc.sort_order ASC`,
      [bundle.id]
    );

    bundle.courses = courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      price: Number(c.price),
      durationHours: c.duration_hours,
      level: c.level,
    }));
    bundle.courseIds = bundle.courses.map((c) => c.id);
    bundle.courseSlugs = bundle.courses.map((c) => c.slug);
    bundle.originalPrice = bundle.courses.reduce((sum, c) => sum + c.price, 0);
    bundle.savings = Math.max(0, bundle.originalPrice - bundle.price);

    return NextResponse.json({ success: true, bundle });
  } catch (err) {
    console.error("Database error fetching bundle:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch bundle." },
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
    name,
    tagline = "",
    description = "",
    price = 0,
    highlight = false,
    status = "published",
    sort_order = 0,
    courseIds = [],
    courseSlugs = [],
  } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ success: false, message: "Bundle name is required." }, { status: 422 });
  }

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT id, slug FROM bundles WHERE id = ? LIMIT 1" : "SELECT id, slug FROM bundles WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Bundle not found." }, { status: 404 });
    }

    const bundleId = existing[0].id;
    const currentSlug = existing[0].slug;
    const newSlug = body.slug ? slugify(body.slug) : slugify(name);

    if (newSlug !== currentSlug) {
      const slugConflict = await query(
        "SELECT id FROM bundles WHERE slug = ? AND id != ? LIMIT 1",
        [newSlug, bundleId]
      );
      if (slugConflict.length > 0) {
        return NextResponse.json(
          { success: false, message: `A bundle with slug "${newSlug}" already exists.` },
          { status: 409 }
        );
      }
    }

    await execute(
      `UPDATE bundles SET
        slug = ?,
        name = ?,
        tagline = ?,
        description = ?,
        price = ?,
        highlight = ?,
        status = ?,
        sort_order = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        newSlug,
        name.trim(),
        tagline?.trim() || null,
        description?.trim() || null,
        Number(price) || 0,
        highlight ? 1 : 0,
        status || "published",
        Number(sort_order) || 0,
        bundleId,
      ]
    );

    // Resolve course IDs (if provided)
    let targetCourseIds = Array.isArray(courseIds) ? [...courseIds] : [];
    if (targetCourseIds.length === 0 && Array.isArray(courseSlugs) && courseSlugs.length > 0) {
      const placeholders = courseSlugs.map(() => "?").join(",");
      const resolvedCourses = await query(`SELECT id FROM courses WHERE slug IN (${placeholders})`, courseSlugs);
      targetCourseIds = resolvedCourses.map((c) => c.id);
    }

    // Refresh bundle courses if specified
    if (body.courseIds !== undefined || body.courseSlugs !== undefined) {
      await execute("DELETE FROM bundle_courses WHERE bundle_id = ?", [bundleId]);
      for (let i = 0; i < targetCourseIds.length; i++) {
        const cId = Number(targetCourseIds[i]);
        if (cId) {
          await execute(
            `INSERT IGNORE INTO bundle_courses (bundle_id, course_id, sort_order) VALUES (?, ?, ?)`,
            [bundleId, cId, i]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bundle updated successfully!",
      id: bundleId,
      slug: newSlug,
    });
  } catch (err) {
    console.error("Database error updating bundle:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update bundle." },
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
      isNumeric ? "SELECT id, name FROM bundles WHERE id = ? LIMIT 1" : "SELECT id, name FROM bundles WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Bundle not found." }, { status: 404 });
    }

    const bundleId = existing[0].id;
    const bundleName = existing[0].name;

    await execute("DELETE FROM bundles WHERE id = ?", [bundleId]);

    return NextResponse.json({
      success: true,
      message: `Bundle "${bundleName}" deleted successfully.`,
      id: bundleId,
    });
  } catch (err) {
    console.error("Database error deleting bundle:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete bundle." },
      { status: 500 }
    );
  }
}
