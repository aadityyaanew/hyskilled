import { query, isDbConfigured } from "@/lib/db";

export async function getBundles() {
  if (isDbConfigured()) {
    try {
      const rows = await query(
        "SELECT * FROM bundles WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC"
      );
      if (rows && rows.length > 0) {
        const bundleCourses = await query(
          `SELECT bc.bundle_id, c.id, c.slug, c.title, c.price, c.duration_hours, c.level, cat.slug as category_slug, cat.short_name as category_name
           FROM bundle_courses bc
           JOIN courses c ON c.id = bc.course_id
           LEFT JOIN categories cat ON cat.id = c.category_id
           ORDER BY bc.sort_order ASC`
        );

        return rows.map((b) => {
          const courses = bundleCourses
            .filter((bc) => bc.bundle_id === b.id)
            .map((c) => ({
              slug: c.slug,
              title: c.title,
              price: Number(c.price),
              durationHours: c.duration_hours,
              level: c.level,
              categorySlug: c.category_slug,
            }));

          const originalPrice = courses.reduce((sum, c) => sum + c.price, 0);
          const bundlePrice = Number(b.price);
          return {
            id: b.id,
            slug: b.slug,
            name: b.name,
            tagline: b.tagline,
            description: b.description,
            price: bundlePrice,
            highlight: Boolean(b.highlight),
            courses,
            categorySlugs: [...new Set(courses.map((c) => c.categorySlug).filter(Boolean))],
            categoryNames: [...new Set(courses.map((c) => c.category_name).filter(Boolean))],
            originalPrice,
            totalHours: courses.reduce((sum, c) => sum + (c.durationHours || 0), 0),
            savings: Math.max(0, originalPrice - bundlePrice),
          };
        });
      }
    } catch (err) {
      console.warn("Could not fetch bundles from MySQL:", err.message);
    }
  }

  return [];
}

export async function getBundleBySlug(slug) {
  if (isDbConfigured()) {
    try {
      const rows = await query("SELECT * FROM bundles WHERE slug = ? LIMIT 1", [slug]);
      if (rows.length > 0) {
        const b = rows[0];
        const courses = await query(
          `SELECT c.slug, c.title, c.price, c.duration_hours, c.level, cat.slug as category_slug, cat.short_name as category_name
           FROM bundle_courses bc
           JOIN courses c ON c.id = bc.course_id
           LEFT JOIN categories cat ON cat.id = c.category_id
           WHERE bc.bundle_id = ?
           ORDER BY bc.sort_order ASC`,
          [b.id]
        );

        const mappedCourses = courses.map((c) => ({
          slug: c.slug,
          title: c.title,
          price: Number(c.price),
          durationHours: c.duration_hours,
          level: c.level,
          categorySlug: c.category_slug,
        }));

        const originalPrice = mappedCourses.reduce((sum, c) => sum + c.price, 0);
        const bundlePrice = Number(b.price);

        return {
          id: b.id,
          slug: b.slug,
          name: b.name,
          tagline: b.tagline,
          description: b.description,
          price: bundlePrice,
          highlight: Boolean(b.highlight),
          courses: mappedCourses,
          categorySlugs: [...new Set(mappedCourses.map((c) => c.categorySlug).filter(Boolean))],
          categoryNames: [...new Set(mappedCourses.map((c) => c.category_name).filter(Boolean))],
          originalPrice,
          totalHours: mappedCourses.reduce((sum, c) => sum + (c.durationHours || 0), 0),
          savings: Math.max(0, originalPrice - bundlePrice),
        };
      }
    } catch (err) {
      console.warn("Could not fetch bundle by slug from MySQL:", err.message);
    }
  }

  return null;
}
