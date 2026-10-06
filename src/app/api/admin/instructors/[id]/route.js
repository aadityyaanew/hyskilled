import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";
import { ensureInstructorsTable } from "@/lib/instructors-db";

export async function GET(request, { params }) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const { id } = await params;

  try {
    await ensureInstructorsTable();

    const rows = await query(
      `SELECT inst.*, COUNT(c.id) as courses_count
       FROM instructors inst
       LEFT JOIN courses c ON c.instructor_id = inst.id
       WHERE inst.id = ?
       GROUP BY inst.id
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Instructor not found." }, { status: 404 });
    }

    const row = rows[0];
    const instructor = {
      id: row.id,
      name: row.name,
      title: row.title || "",
      bio: row.bio || "",
      rating: Number(row.rating) || 4.8,
      learners: Number(row.learners) || 0,
      courses: Number(row.courses_count) || 0,
      imageUrl: row.image_url || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return NextResponse.json({ success: true, instructor });
  } catch (err) {
    console.error("Database error fetching instructor:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch instructor." },
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
    title = "",
    bio = "",
    rating = 4.8,
    learners = 0,
    imageUrl = null,
    image_url = null,
  } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ success: false, message: "Instructor name is required." }, { status: 422 });
  }

  const resolvedImageUrl = imageUrl !== undefined ? imageUrl : (image_url || null);

  try {
    await ensureInstructorsTable();

    const existing = await query("SELECT id FROM instructors WHERE id = ? LIMIT 1", [id]);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Instructor not found." }, { status: 404 });
    }

    await execute(
      `UPDATE instructors SET
        name = ?,
        title = ?,
        bio = ?,
        rating = ?,
        learners = ?,
        image_url = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        name.trim(),
        title?.trim() || null,
        bio?.trim() || null,
        Math.min(5, Math.max(1, Number(rating) || 4.8)),
        Number(learners) || 0,
        resolvedImageUrl,
        id,
      ]
    );

    try {
      revalidatePath("/admin/instructors");
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/about");
      revalidatePath("/");
    } catch (e) {
      console.warn("revalidatePath error on update instructor:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Instructor "${name.trim()}" updated successfully!`,
      instructor: {
        id,
        name: name.trim(),
        title: title?.trim() || "",
        bio: bio?.trim() || "",
        rating: Number(rating) || 4.8,
        learners: Number(learners) || 0,
        imageUrl: resolvedImageUrl,
      },
    });
  } catch (err) {
    console.error("Database error updating instructor:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update instructor." },
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
    await ensureInstructorsTable();

    const existing = await query("SELECT id, name FROM instructors WHERE id = ? LIMIT 1", [id]);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Instructor not found." }, { status: 404 });
    }

    const instructor = existing[0];

    // Check if courses are linked to this instructor
    const linkedCourses = await query(
      "SELECT id, title, slug FROM courses WHERE instructor_id = ? LIMIT 5",
      [id]
    );

    if (linkedCourses.length > 0) {
      const titles = linkedCourses.map((c) => `"${c.title}"`).join(", ");
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete "${instructor.name}" because they are currently assigned to ${linkedCourses.length} course(s): ${titles}. Please reassign or update those courses before deleting this instructor.`,
        },
        { status: 400 }
      );
    }

    await execute("DELETE FROM instructors WHERE id = ?", [id]);

    try {
      revalidatePath("/admin/instructors");
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/about");
      revalidatePath("/");
    } catch (e) {
      console.warn("revalidatePath error on delete instructor:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Instructor "${instructor.name}" deleted successfully.`,
      id,
    });
  } catch (err) {
    console.error("Database error deleting instructor:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete instructor." },
      { status: 500 }
    );
  }
}
