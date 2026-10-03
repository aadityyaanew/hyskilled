import { NextResponse } from "next/server";
import { requireAdmin, slugify, safeJsonParse } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  try {
    const categories = await query(
      `SELECT cat.*, COUNT(c.id) as course_count
       FROM categories cat
       LEFT JOIN courses c ON c.category_id = cat.id
       GROUP BY cat.id
       ORDER BY cat.sort_order ASC, cat.id ASC`
    );

    const formatted = categories.map((cat) => ({
      ...cat,
      keywords: safeJsonParse(cat.keywords, []),
    }));

    return NextResponse.json({ success: true, categories: formatted });
  } catch (err) {
    console.error("Database error fetching categories:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch categories." },
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

  const slug = body.slug ? slugify(body.slug) : slugify(name);
  const shortName = short_name?.trim() || name.trim();

  try {
    const existing = await query("SELECT id FROM categories WHERE slug = ? LIMIT 1", [slug]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `A category with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const keywordArray = Array.isArray(keywords)
      ? keywords
      : typeof keywords === "string"
      ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    const result = await execute(
      `INSERT INTO categories (
        slug, name, short_name, icon, description, hue, keywords, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        name.trim(),
        shortName,
        icon || "Code2",
        description?.trim() || null,
        Number(hue) || 24,
        JSON.stringify(keywordArray),
        Number(sort_order) || 0,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Category created successfully!",
      id: result.insertId,
      slug,
    });
  } catch (err) {
    console.error("Database error creating category:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create category." },
      { status: 500 }
    );
  }
}
