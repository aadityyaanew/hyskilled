import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";
import { ensureInstructorsTable } from "@/lib/instructors-db";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  try {
    await ensureInstructorsTable();

    const rows = await query(
      `SELECT inst.*, COUNT(c.id) as courses_count
       FROM instructors inst
       LEFT JOIN courses c ON c.instructor_id = inst.id
       GROUP BY inst.id
       ORDER BY inst.name ASC`
    );

    const instructors = (rows || []).map((row) => ({
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
    }));

    return NextResponse.json({ success: true, instructors });
  } catch (err) {
    console.error("Database error fetching instructors:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch instructors." },
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

  const id = body.id || (body.slug ? slugify(body.slug) : slugify(name));
  if (!id) {
    return NextResponse.json({ success: false, message: "Valid instructor ID/slug is required." }, { status: 422 });
  }

  const resolvedImageUrl = imageUrl || image_url || null;

  try {
    await ensureInstructorsTable();

    const existing = await query("SELECT id FROM instructors WHERE id = ? LIMIT 1", [id]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `An instructor with ID "${id}" already exists. Please choose a different name or ID.` },
        { status: 409 }
      );
    }

    await execute(
      `INSERT INTO instructors (id, name, title, bio, rating, learners, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        title?.trim() || null,
        bio?.trim() || null,
        Math.min(5, Math.max(1, Number(rating) || 4.8)),
        Number(learners) || 0,
        resolvedImageUrl,
      ]
    );

    try {
      revalidatePath("/admin/instructors");
      revalidatePath("/admin/courses");
      revalidatePath("/courses");
      revalidatePath("/about");
      revalidatePath("/");
    } catch (e) {
      console.warn("revalidatePath error on create instructor:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Instructor profile created successfully!",
      instructor: {
        id,
        name: name.trim(),
        title: title?.trim() || "",
        bio: bio?.trim() || "",
        rating: Number(rating) || 4.8,
        learners: Number(learners) || 0,
        courses: 0,
        imageUrl: resolvedImageUrl,
      },
    });
  } catch (err) {
    console.error("Database error creating instructor:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create instructor." },
      { status: 500 }
    );
  }
}
