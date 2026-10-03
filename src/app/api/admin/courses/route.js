import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth-server";
import { query, execute, isDbConfigured } from "@/lib/db";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function POST(request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    title,
    subtitle,
    categorySlug,
    level = "Beginner",
    durationHours = 20,
    price = 3999,
    originalPrice,
    tags = [],
    shortDescription,
    description,
  } = body;

  if (!title) {
    return NextResponse.json({ message: "Title is required." }, { status: 422 });
  }

  const slug = slugify(title);

  if (isDbConfigured()) {
    try {
      // Find category id
      const catRows = await query(
        "SELECT id FROM categories WHERE slug = ? LIMIT 1",
        [categorySlug]
      );
      const categoryId = catRows[0]?.id || 1;

      await execute(
        `INSERT INTO courses (
          slug, title, subtitle, category_id, level, duration_hours,
          price, original_price, tags, short_description, description,
          status, app_course_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)`,
        [
          slug,
          title,
          subtitle || "",
          categoryId,
          level,
          Number(durationHours),
          Number(price),
          originalPrice ? Number(originalPrice) : null,
          JSON.stringify(tags),
          shortDescription || "",
          description || "",
          slug,
        ]
      );

      return NextResponse.json({ success: true, slug });
    } catch (err) {
      console.error("Database error inserting course:", err);
      return NextResponse.json(
        { message: err.message || "Failed to save course to database." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true, slug, notice: "Saved in standby mode." });
}
