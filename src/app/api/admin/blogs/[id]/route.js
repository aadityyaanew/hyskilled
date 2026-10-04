import { NextResponse } from "next/server";
import { requireAdmin, slugify } from "@/lib/admin-api";
import { query, execute, isDbConfigured } from "@/lib/db";
import { mapBlogRow, normalizeBlogPayload } from "@/services/blogs.service";

async function guard() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;
  if (!isDbConfigured()) {
    return NextResponse.json({ success: false, message: "Database not configured." }, { status: 500 });
  }
  return null;
}

const notFound = () =>
  NextResponse.json({ success: false, message: "Blog post not found." }, { status: 404 });

export async function GET(request, { params }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  try {
    const rows = await query("SELECT * FROM blog_posts WHERE id = ? LIMIT 1", [Number(id)]);
    if (!rows[0]) return notFound();
    return NextResponse.json({ success: true, post: mapBlogRow(rows[0]) });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const rows = await query("SELECT * FROM blog_posts WHERE id = ? LIMIT 1", [Number(id)]);
    if (!rows[0]) return notFound();

    // Partial update support (e.g. publish/unpublish toggle sends only { status }).
    const current = mapBlogRow(rows[0]);
    const data = normalizeBlogPayload({ ...current, ...body });
    if (!data.title) {
      return NextResponse.json({ success: false, message: "Title is required." }, { status: 422 });
    }

    const slug = slugify(body.slug || current.slug || data.title);
    const conflict = await query("SELECT id FROM blog_posts WHERE slug = ? AND id != ? LIMIT 1", [
      slug,
      Number(id),
    ]);
    if (conflict.length > 0) {
      return NextResponse.json(
        { success: false, message: `A post with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    await execute(
      `UPDATE blog_posts SET slug = ?, title = ?, featured_image = ?, short_description = ?,
        content = ?, author = ?, tags = ?, status = ?, publish_date = ? WHERE id = ?`,
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
        Number(id),
      ]
    );

    const updated = await query("SELECT * FROM blog_posts WHERE id = ? LIMIT 1", [Number(id)]);
    return NextResponse.json({ success: true, message: "Blog post updated.", post: mapBlogRow(updated[0]) });
  } catch (err) {
    console.error("Error updating blog post:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  try {
    const result = await execute("DELETE FROM blog_posts WHERE id = ?", [Number(id)]);
    if (!result.affectedRows) return notFound();
    return NextResponse.json({ success: true, message: "Blog post deleted." });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message || "Failed to delete post." }, { status: 500 });
  }
}
