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
      ? `SELECT cat.*, COUNT(c.id) as course_count
         FROM categories cat
         LEFT JOIN courses c ON c.category_id = cat.id
         WHERE cat.id = ? GROUP BY cat.id LIMIT 1`
      : `SELECT cat.*, COUNT(c.id) as course_count
         FROM categories cat
         LEFT JOIN courses c ON c.category_id = cat.id
         WHERE cat.slug = ? GROUP BY cat.id LIMIT 1`;

    const rows = await query(sql, [isNumeric ? Number(id) : id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    const cat = rows[0];
    cat.keywords = safeJsonParse(cat.keywords, []);

    return NextResponse.json({ success: true, category: cat });
  } catch (err) {
    console.error("Database error fetching category:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch category." },
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
    short_name,
    icon = "Code2",
    description = "",
    hue = 24,
    keywords = [],
    sort_order = 0,
  } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ success: false, message: "Category name is required." }, { status: 422 });
  }

  try {
    const isNumeric = /^\d+$/.test(id);
    const existing = await query(
      isNumeric ? "SELECT id, slug FROM categories WHERE id = ? LIMIT 1" : "SELECT id, slug FROM categories WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    const categoryId = existing[0].id;
    const currentSlug = existing[0].slug;
    const newSlug = body.slug ? slugify(body.slug) : slugify(name);

    if (newSlug !== currentSlug) {
      const slugConflict = await query(
        "SELECT id FROM categories WHERE slug = ? AND id != ? LIMIT 1",
        [newSlug, categoryId]
      );
      if (slugConflict.length > 0) {
        return NextResponse.json(
          { success: false, message: `A category with slug "${newSlug}" already exists.` },
          { status: 409 }
        );
      }
    }

    const keywordArray = Array.isArray(keywords)
      ? keywords
      : typeof keywords === "string"
      ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    await execute(
      `UPDATE categories SET
        slug = ?,
        name = ?,
        short_name = ?,
        icon = ?,
        description = ?,
        hue = ?,
        keywords = ?,
        sort_order = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        newSlug,
        name.trim(),
        short_name?.trim() || name.trim(),
        icon || "Code2",
        description?.trim() || null,
        Number(hue) || 24,
        JSON.stringify(keywordArray),
        Number(sort_order) || 0,
        categoryId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully!",
      id: categoryId,
      slug: newSlug,
    });
  } catch (err) {
    console.error("Database error updating category:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update category." },
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
      isNumeric ? "SELECT id, name FROM categories WHERE id = ? LIMIT 1" : "SELECT id, name FROM categories WHERE slug = ? LIMIT 1",
      [isNumeric ? Number(id) : id]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    const categoryId = existing[0].id;
    const categoryName = existing[0].name;

    // Check if courses are linked to this category
    const [usage] = await query("SELECT COUNT(*) as count FROM courses WHERE category_id = ?", [categoryId]);
    if (usage && usage.count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete "${categoryName}" because ${usage.count} course(s) are assigned to it. Please reassign or delete those courses first.`,
        },
        { status: 400 }
      );
    }

    await execute("DELETE FROM categories WHERE id = ?", [categoryId]);

    return NextResponse.json({
      success: true,
      message: `Category "${categoryName}" deleted successfully.`,
      id: categoryId,
    });
  } catch (err) {
    console.error("Database error deleting category:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete category." },
      { status: 500 }
    );
  }
}
