import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";
import { ensureCourseOrderColumn } from "@/lib/course-order";
import { ensureInstructorsTable } from "@/lib/instructors-db";

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

    sql += ` ORDER BY c.display_order ASC, c.id ASC`;

    await ensureCourseOrderColumn();
    await ensureInstructorsTable();
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
    instructorBioOverride = null,
    instructor_bio_override = null,
    level = "Beginner",
    language = "English",
    learners = 0,
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
    syllabusDriveFileId = null,
    syllabusUrl = null,
    imageUrl = null,
    closingDate = null,
    closingTimerEnabled = false,
  } = body;

  const resolvedSyllabusDriveFileId = syllabusDriveFileId || body.syllabus_drive_file_id || null;
  const resolvedSyllabusUrl = syllabusUrl || body.syllabus_url || null;
  const resolvedImageUrl = imageUrl || body.image_url || body.thumbnail || null;
  const resolvedInstructorBioOverride = instructorBioOverride || instructor_bio_override || body.instructorBioOverride || body.instructor_bio_override || null;
  const resolvedLanguage = language || body.language || "English";
  const resolvedLearners = Number(learners !== undefined ? learners : body.learners) || 0;
  
  let resolvedClosingDate = null;
  const rawClosingDate = closingDate || body.closing_date;
  if (rawClosingDate) {
    const d = new Date(rawClosingDate);
    if (!Number.isNaN(d.getTime())) {
      resolvedClosingDate = d;
    }
  }

  const resolvedClosingTimerEnabled = Boolean(
    closingTimerEnabled ?? body.closing_timer_enabled
  );

  const resolvedInstructorId = instructorId || body.instructor_id || "aarav-mehta";

  const defaultModules = [
    { title: "Course Introduction & Fundamentals", summary: "Core foundation principles and ecosystem overview." },
    { title: "Practical Concepts & Tooling", summary: "In-depth understanding of standard tools and techniques." },
    { title: "Hands-on Project & Implementation", summary: "Real-world project implementation and industry best practices." },
    { title: "Advanced Topics & Portfolio Preparation", summary: "Production readiness, deployment, and career guidance." },
  ];
  const resolvedModules = Array.isArray(modules) && modules.length > 0 ? modules : defaultModules;

  const defaultAudience = ["Students and professionals looking to upskill in technology", "Anyone wanting hands-on practical project experience"];
  const resolvedAudience = Array.isArray(audience) && audience.length > 0 ? audience : defaultAudience;

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

    await ensureCourseOrderColumn();
    await ensureInstructorsTable();
    const [{ nextOrder }] = await query("SELECT COALESCE(MAX(display_order), 0) + 1 AS nextOrder FROM courses");

    const result = await execute(
      `INSERT INTO courses (
        slug, title, subtitle, category_id, instructor_id, instructor_bio_override, level, language, duration_hours,
        price, original_price, learners, badge, tags, short_description, description,
        outcomes, requirements, audience, modules, status, app_course_id,
        syllabus_drive_file_id, syllabus_url, image_url, closing_date, closing_timer_enabled, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        title.trim(),
        subtitle?.trim() || null,
        targetCatId,
        resolvedInstructorId,
        resolvedInstructorBioOverride,
        level,
        resolvedLanguage,
        Number(durationHours) || 0,
        Number(price) || 0,
        originalPrice ? Number(originalPrice) : null,
        resolvedLearners,
        badge?.trim() || null,
        JSON.stringify(Array.isArray(tags) ? tags : []),
        shortDescription?.trim() || null,
        description?.trim() || null,
        JSON.stringify(Array.isArray(outcomes) ? outcomes : []),
        JSON.stringify(Array.isArray(requirements) ? requirements : []),
        JSON.stringify(resolvedAudience),
        JSON.stringify(resolvedModules),
        status || "published",
        appCourseId?.trim() || slug,
        resolvedSyllabusDriveFileId,
        resolvedSyllabusUrl,
        resolvedImageUrl,
        resolvedClosingDate,
        resolvedClosingTimerEnabled ? 1 : 0,
        Number(nextOrder) || 1,
      ]
    );

    try {
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/");
      revalidatePath(`/courses/${slug}`);
      revalidatePath("/categories");
    } catch (e) {
      console.warn("revalidatePath error on create:", e);
    }

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
