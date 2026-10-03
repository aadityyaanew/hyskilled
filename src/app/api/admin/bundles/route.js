import { NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  try {
    const bundles = await query(
      `SELECT * FROM bundles ORDER BY sort_order ASC, created_at DESC`
    );

    // Fetch bundle courses
    const bundleCourses = await query(
      `SELECT bc.bundle_id, bc.sort_order, c.id, c.slug, c.title, c.price, c.duration_hours, c.level
       FROM bundle_courses bc
       JOIN courses c ON c.id = bc.course_id
       ORDER BY bc.sort_order ASC`
    );

    const map = new Map();
    for (const b of bundles) {
      map.set(b.id, {
        ...b,
        price: Number(b.price),
        highlight: Boolean(b.highlight),
        courses: [],
        courseIds: [],
        courseSlugs: [],
        originalPrice: 0,
        savings: 0,
      });
    }

    for (const bc of bundleCourses) {
      if (map.has(bc.bundle_id)) {
        const b = map.get(bc.bundle_id);
        const cPrice = Number(bc.price || 0);
        b.courses.push({
          id: bc.id,
          slug: bc.slug,
          title: bc.title,
          price: cPrice,
          durationHours: bc.duration_hours,
          level: bc.level,
        });
        b.courseIds.push(bc.id);
        b.courseSlugs.push(bc.slug);
        b.originalPrice += cPrice;
      }
    }

    for (const b of map.values()) {
      b.savings = Math.max(0, b.originalPrice - b.price);
    }

    return NextResponse.json({ success: true, bundles: Array.from(map.values()) });
  } catch (err) {
    console.error("Database error fetching admin bundles:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch bundles." },
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

  const slug = body.slug ? slugify(body.slug) : slugify(name);

  try {
    const existing = await query("SELECT id FROM bundles WHERE slug = ? LIMIT 1", [slug]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `A bundle with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const result = await execute(
      `INSERT INTO bundles (slug, name, tagline, description, price, highlight, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        name.trim(),
        tagline?.trim() || null,
        description?.trim() || null,
        Number(price) || 0,
        highlight ? 1 : 0,
        status || "published",
        Number(sort_order) || 0,
      ]
    );

    const bundleId = result.insertId;

    // Resolve course IDs (either from courseIds or courseSlugs)
    let targetCourseIds = [...(courseIds || [])];
    if (targetCourseIds.length === 0 && Array.isArray(courseSlugs) && courseSlugs.length > 0) {
      const placeholders = courseSlugs.map(() => "?").join(",");
      const resolvedCourses = await query(`SELECT id FROM courses WHERE slug IN (${placeholders})`, courseSlugs);
      targetCourseIds = resolvedCourses.map((c) => c.id);
    }

    // Insert bundle courses
    for (let i = 0; i < targetCourseIds.length; i++) {
      const cId = Number(targetCourseIds[i]);
      if (cId) {
        await execute(
          `INSERT IGNORE INTO bundle_courses (bundle_id, course_id, sort_order) VALUES (?, ?, ?)`,
          [bundleId, cId, i]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Bundle created successfully!",
      id: bundleId,
      slug,
    });
  } catch (err) {
    console.error("Database error creating bundle:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create bundle." },
      { status: 500 }
    );
  }
}
