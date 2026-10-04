import { query, isDbConfigured } from "@/lib/db";
import { safeJsonParse } from "@/lib/admin-api";

function toIso(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function mapBlogRow(row) {
  const tags = safeJsonParse(row.tags, []);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    featured_image: row.featured_image || "",
    short_description: row.short_description || "",
    content: row.content || "",
    author: row.author || "",
    tags: Array.isArray(tags) ? tags : [],
    status: row.status,
    publish_date: toIso(row.publish_date),
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

const PUBLISHED_WHERE = `status = 'published' AND (publish_date IS NULL OR publish_date <= NOW())`;

export async function getPublishedPosts() {
  if (!isDbConfigured()) return [];
  try {
    const rows = await query(
      `SELECT * FROM blog_posts WHERE ${PUBLISHED_WHERE}
       ORDER BY COALESCE(publish_date, created_at) DESC`
    );
    return rows.map(mapBlogRow);
  } catch (err) {
    console.error("getPublishedPosts failed:", err);
    return [];
  }
}

export async function getPublishedPostBySlug(slug) {
  if (!isDbConfigured()) return null;
  try {
    const rows = await query(
      `SELECT * FROM blog_posts WHERE slug = ? AND ${PUBLISHED_WHERE} LIMIT 1`,
      [slug]
    );
    return rows[0] ? mapBlogRow(rows[0]) : null;
  } catch (err) {
    console.error("getPublishedPostBySlug failed:", err);
    return null;
  }
}

export async function getAdminBlogPosts() {
  if (!isDbConfigured()) return [];
  try {
    const rows = await query(
      "SELECT * FROM blog_posts ORDER BY COALESCE(publish_date, created_at) DESC"
    );
    return rows.map(mapBlogRow);
  } catch (err) {
    console.error("getAdminBlogPosts failed:", err);
    return [];
  }
}

/** Normalize an incoming admin payload. */
export function normalizeBlogPayload(body) {
  const tags = Array.isArray(body.tags)
    ? body.tags
    : typeof body.tags === "string"
    ? body.tags.split(",")
    : [];
  const status = body.status === "published" ? "published" : "draft";
  let publishDate = null;
  if (body.publish_date) {
    const d = new Date(body.publish_date);
    if (!Number.isNaN(d.getTime())) publishDate = d;
  }
  if (status === "published" && !publishDate) publishDate = new Date();

  return {
    title: String(body.title || "").trim(),
    slug: body.slug ? String(body.slug) : "",
    featured_image: String(body.featured_image || "").trim() || null,
    short_description: String(body.short_description || "").trim().slice(0, 500) || null,
    content: String(body.content || ""),
    author: String(body.author || "").trim() || "Hyskilled Team",
    tags: [...new Set(tags.map((t) => String(t).trim()).filter(Boolean))],
    status,
    publish_date: publishDate,
  };
}
