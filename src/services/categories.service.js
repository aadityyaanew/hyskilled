import { query, isDbConfigured } from "@/lib/db";
import { safeJsonParse } from "@/lib/admin-api";

export async function getCategories() {
  if (isDbConfigured()) {
    try {
      const rows = await query(`
        SELECT cat.*, COUNT(c.id) as course_count
        FROM categories cat
        LEFT JOIN courses c ON c.category_id = cat.id AND c.status = 'published'
        GROUP BY cat.id
        ORDER BY cat.sort_order ASC, cat.id ASC
      `);
      if (rows && rows.length > 0) {
        return rows.map((cat) => ({
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          short: cat.short_name || cat.name,
          icon: cat.icon || "Code2",
          description: cat.description || "",
          hue: cat.hue || 24,
          keywords: safeJsonParse(cat.keywords, []),
          courseCount: Number(cat.course_count) || 0,
        }));
      }
    } catch (err) {
      console.error("Could not fetch categories from MySQL:", err.message);
    }
  }

  return [];
}

export async function getCategoryBySlug(slug) {
  if (isDbConfigured()) {
    try {
      const rows = await query(
        `SELECT cat.*, COUNT(c.id) as course_count
         FROM categories cat
         LEFT JOIN courses c ON c.category_id = cat.id AND c.status = 'published'
         WHERE cat.slug = ?
         GROUP BY cat.id
         LIMIT 1`,
        [slug]
      );
      if (rows && rows.length > 0) {
        const cat = rows[0];
        return {
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          short: cat.short_name || cat.name,
          icon: cat.icon || "Code2",
          description: cat.description || "",
          hue: cat.hue || 24,
          keywords: safeJsonParse(cat.keywords, []),
          courseCount: Number(cat.course_count) || 0,
        };
      }
      return null;
    } catch (err) {
      console.error("Could not fetch category by slug from MySQL:", err.message);
      return null;
    }
  }

  return null;
}

export async function getAllCategorySlugs() {
  if (isDbConfigured()) {
    try {
      const rows = await query("SELECT slug FROM categories ORDER BY sort_order ASC, id ASC");
      return (rows || []).map((r) => r.slug);
    } catch (err) {
      console.error("Could not fetch category slugs from MySQL:", err.message);
      return [];
    }
  }
  return [];
}
