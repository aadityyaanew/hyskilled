import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify, safeJsonParse } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";
import { deleteFileFromR2 } from "@/lib/r2";

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
    course.syllabusDriveFileId = course.syllabus_drive_file_id || null;
    course.syllabusUrl = course.syllabus_url || null;
    course.imageUrl = course.image_url || null;
    course.closingDate = course.closing_date ? new Date(course.closing_date).toISOString() : null;
    course.closingTimerEnabled = Boolean(course.closing_timer_enabled);

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
    instructorId,
    level = "Beginner",
    durationHours = 20,
    price = 0,
    originalPrice = null,
    badge = null,
    tags,
    shortDescription = "",
    description = "",
    outcomes,
    requirements,
    audience,
    modules,
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

  if (!title || !title.trim()) {
    return NextResponse.json({ success: false, message: "Course title is required." }, { status: 422 });
  }

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT * FROM courses WHERE id = ? LIMIT 1" : "SELECT * FROM courses WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const existingCourse = existing[0];
    const targetCourseId = existingCourse.id;
    const currentSlug = existingCourse.slug;
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

    // Safely preserve relational fields if not explicitly sent in body
    const targetInstructorId = instructorId !== undefined ? (instructorId || null) : (existingCourse.instructor_id || "aarav-mehta");
    const targetModules = modules !== undefined ? (Array.isArray(modules) ? modules : []) : safeJsonParse(existingCourse.modules, []);
    const targetAudience = audience !== undefined ? (Array.isArray(audience) ? audience : []) : safeJsonParse(existingCourse.audience, []);
    const targetOutcomes = outcomes !== undefined ? (Array.isArray(outcomes) ? outcomes : []) : safeJsonParse(existingCourse.outcomes, []);
    const targetRequirements = requirements !== undefined ? (Array.isArray(requirements) ? requirements : []) : safeJsonParse(existingCourse.requirements, []);
    const targetTags = tags !== undefined ? (Array.isArray(tags) ? tags : []) : safeJsonParse(existingCourse.tags, []);

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
        syllabus_drive_file_id = ?,
        syllabus_url = ?,
        image_url = ?,
        closing_date = ?,
        closing_timer_enabled = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        newSlug,
        title.trim(),
        subtitle?.trim() || null,
        targetCatId,
        targetInstructorId,
        level,
        Number(durationHours) || 0,
        Number(price) || 0,
        originalPrice ? Number(originalPrice) : null,
        badge?.trim() || null,
        JSON.stringify(targetTags),
        shortDescription?.trim() || null,
        description?.trim() || null,
        JSON.stringify(targetOutcomes),
        JSON.stringify(targetRequirements),
        JSON.stringify(targetAudience),
        JSON.stringify(targetModules),
        status || "published",
        appCourseId?.trim() || newSlug,
        resolvedSyllabusDriveFileId,
        resolvedSyllabusUrl,
        resolvedImageUrl,
        resolvedClosingDate,
        resolvedClosingTimerEnabled ? 1 : 0,
        targetCourseId,
      ]
    );

    try {
      revalidatePath("/admin/courses");
      revalidatePath(`/admin/courses/${targetCourseId}/edit`);
      revalidatePath("/courses");
      revalidatePath("/");
      revalidatePath(`/courses/${currentSlug}`);
      if (newSlug !== currentSlug) {
        revalidatePath(`/courses/${newSlug}`);
      }
      revalidatePath("/categories");
    } catch (e) {
      console.warn("revalidatePath error on update:", e);
    }

    // Delete old syllabus from R2 if it was changed or removed
    if (existingCourse.syllabus_drive_file_id && existingCourse.syllabus_drive_file_id !== resolvedSyllabusDriveFileId) {
      deleteFileFromR2(existingCourse.syllabus_drive_file_id).catch(err => {
        console.error("Failed to delete old syllabus from R2:", err);
      });
    }

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

export async function PATCH(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT id, title, slug, status FROM courses WHERE id = ? LIMIT 1" : "SELECT id, title, slug, status FROM courses WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const courseId = existing[0].id;
    const courseTitle = existing[0].title;
    const courseSlug = existing[0].slug;

    // Action: reopen course
    if (body.action === "reopen") {
      await execute(
        `UPDATE courses SET
          status = 'published',
          closing_timer_enabled = 0,
          closing_date = NULL,
          updated_at = NOW()
        WHERE id = ?`,
        [courseId]
      );

      try {
        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        revalidatePath("/");
        if (courseSlug) revalidatePath(`/courses/${courseSlug}`);
        revalidatePath("/categories");
      } catch (e) {
        console.warn("revalidate error on reopen:", e);
      }

      return NextResponse.json({
        success: true,
        message: `Course "${courseTitle}" has been reopened successfully.`,
      });
    }

    // Action: close course
    if (body.action === "close") {
      await execute(
        `UPDATE courses SET
          status = 'closed',
          updated_at = NOW()
        WHERE id = ?`,
        [courseId]
      );

      try {
        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        revalidatePath("/");
        if (courseSlug) revalidatePath(`/courses/${courseSlug}`);
        revalidatePath("/categories");
      } catch (e) {
        console.warn("revalidate error on close:", e);
      }

      return NextResponse.json({
        success: true,
        message: `Course "${courseTitle}" has been marked as closed.`,
      });
    }

    // Generic status update
    if (body.status) {
      await execute(
        `UPDATE courses SET status = ?, updated_at = NOW() WHERE id = ?`,
        [body.status, courseId]
      );

      try {
        revalidatePath("/admin/courses");
        revalidatePath("/courses");
        revalidatePath("/");
        if (courseSlug) revalidatePath(`/courses/${courseSlug}`);
        revalidatePath("/categories");
      } catch (e) {
        console.warn("revalidate error on status update:", e);
      }

      return NextResponse.json({
        success: true,
        message: `Course "${courseTitle}" status updated to ${body.status}.`,
      });
    }

    return NextResponse.json({ success: false, message: "No valid action provided." }, { status: 400 });
  } catch (err) {
    console.error("Database error patching course:", err);
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
      isNumeric ? "SELECT id, title, slug, syllabus_drive_file_id FROM courses WHERE id = ? LIMIT 1" : "SELECT id, title, slug, syllabus_drive_file_id FROM courses WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Course not found." }, { status: 404 });
    }

    const courseId = existing[0].id;
    const courseTitle = existing[0].title;
    const courseSlug = existing[0].slug;

    // Clean up dependent records safely
    await execute("DELETE FROM bundle_courses WHERE course_id = ?", [courseId]);
    await execute("UPDATE order_items SET course_id = NULL WHERE course_id = ?", [courseId]);
    await execute("DELETE FROM enrollments WHERE course_id = ?", [courseId]);
    await execute("DELETE FROM courses WHERE id = ?", [courseId]);

    try {
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/");
      if (courseSlug) revalidatePath(`/courses/${courseSlug}`);
      revalidatePath("/categories");
    } catch (e) {
      console.warn("revalidate error on delete:", e);
    }

    // Delete syllabus from R2 if it exists
    if (existing[0].syllabus_drive_file_id) {
      deleteFileFromR2(existing[0].syllabus_drive_file_id).catch(err => {
        console.error("Failed to delete syllabus from R2:", err);
      });
    }

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
