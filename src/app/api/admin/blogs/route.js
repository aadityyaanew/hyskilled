import { NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";
import { getAdminBlogPosts, normalizeBlogPayload } from "@/services/blogs.service";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }
  const posts = await getAdminBlogPosts();
  return NextResponse.json({ success: true, posts });
}

export async function POST(request) {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const data = normalizeBlogPayload(body);
  if (!data.title) {
    return NextResponse.json({ success: false, message: "Title is required." }, { status: 422 });
  }

  const slug = slugify(data.slug || data.title);
  if (!slug) {
    return NextResponse.json({ success: false, message: "Invalid slug." }, { status: 422 });
  }

  try {
    const existing = await query("SELECT id FROM blog_posts WHERE slug = ? LIMIT 1", [slug]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `A post with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const result = await execute(
      `INSERT INTO blog_posts
        (slug, title, featured_image, short_description, content, author, tags, status, publish_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        data.title,
        data.featured_image,
        data.short_description,
        data.content,
        data.author,
        JSON.stringify(data.tags),
        data.status,
        data.publish_date,
      ]
    );
    return NextResponse.json({ success: true, message: "Blog post created.", id: result.insertId, slug });
  } catch (err) {
    console.error("Error creating blog post:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed to create post." }, { status: 500 });
  }
}
