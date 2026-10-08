
import { PAGE_SIZE, PRICE_RANGES } from "@/lib/catalog-options";
import { query, isDbConfigured } from "@/lib/db";
import { ensureCourseOrderColumn } from "@/lib/course-order";
import { ensureInstructorsTable } from "@/lib/instructors-db";
import { safeJsonParse } from "@/lib/admin-api";

export { PAGE_SIZE, SORT_OPTIONS, LEVELS, PRICE_RANGES } from "@/lib/catalog-options";



export function isCourseClosed(course) {
  if (!course) return false;
  if (course.status === "closed") return true;
  if (course.closingTimerEnabled && course.closingDate) {
    const closeTime = new Date(course.closingDate).getTime();
    if (!Number.isNaN(closeTime) && closeTime <= Date.now()) {
      return true;
    }
  }
  return false;
}

export function mapDbCourseRow(r) {
  const tags = safeJsonParse(r.tags, []);
  const outcomes = safeJsonParse(r.outcomes, []);
  const requirements = safeJsonParse(r.requirements, []);
  const audience = safeJsonParse(r.audience, []);
  const modules = safeJsonParse(r.modules, []);

  const closingDate = r.closing_date ? new Date(r.closing_date).toISOString() : null;
  const closingTimerEnabled = Boolean(r.closing_timer_enabled);
  const isClosed =
    r.status === "closed" ||
    Boolean(closingTimerEnabled && closingDate && new Date(closingDate).getTime() <= Date.now());

  const categorySlug = r.category_slug || r.categorySlug || "generative-ai";
  const categoryRow = r.category_slug ? {
    id: r.category_id,
    slug: r.category_slug,
    name: r.category_name,
    short: r.category_short_name || r.category_name,
    icon: r.category_icon || "Code2",
    description: r.category_description || "",
    hue: Number(r.category_hue) || 24,
    keywords: safeJsonParse(r.category_keywords, []),
  } : null;

  const instructorRow = r.inst_name ? {
    id: r.instructor_id || r.instructorId,
    name: r.inst_name,
    title: r.inst_title || "",
    bio: r.instructor_bio_override || r.inst_bio || "",
    rating: Number(r.inst_rating) || 4.8,
    learners: Number(r.inst_learners) || 0,
    courses: 1,
    imageUrl: r.inst_image_url || null,
  } : null;

  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle || "",
    categorySlug,
    instructorId: r.instructor_id || r.instructorId || "aarav-mehta",
    instructorBioOverride: r.instructor_bio_override || null,
    instructorRow,
    categoryRow,
    level: r.level || "Beginner",
    language: r.language || "English",
    durationHours: Number(r.duration_hours) || 20,
    price: Number(r.price) || 0,
    originalPrice: r.original_price ? Number(r.original_price) : null,
    rating: Number(r.rating) || 4.8,
    reviewCount: Number(r.review_count) || 0,
    learners: Number(r.learners) || 0,
    badge: r.badge || null,
    tags: Array.isArray(tags) ? tags : [],
    shortDescription: r.short_description || r.shortDescription || "",
    description: r.description || "",
    outcomes: Array.isArray(outcomes) ? outcomes : [],
    requirements: Array.isArray(requirements) ? requirements : [],
    audience: Array.isArray(audience) ? audience : [],
    modules: Array.isArray(modules) ? modules : [],
    moduleCount: Array.isArray(modules) && modules.length > 0 ? modules.length : 6,
    status: r.status || "published",
    appCourseId: r.app_course_id || r.slug,
    syllabusDriveFileId: r.syllabus_drive_file_id || null,
    syllabusUrl: r.syllabus_url || null,
    imageUrl: r.image_url || null,
    thumbnail: r.image_url || null,
    closingDate,
    closingTimerEnabled,
    isClosed,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  };
}

async function getSourceCourses() {
  if (isDbConfigured()) {
    try {
      await ensureCourseOrderColumn();
      const rows = await query(`
        SELECT c.*, cat.id as category_id, cat.name as category_name, cat.slug as category_slug,
               cat.short_name as category_short_name, cat.icon as category_icon, 
               cat.description as category_description, cat.hue as category_hue, 
               cat.keywords as category_keywords,
               inst.name as inst_name, inst.title as inst_title, inst.bio as inst_bio,
               inst.rating as inst_rating, inst.learners as inst_learners, inst.image_url as inst_image_url
        FROM courses c
        LEFT JOIN categories cat ON cat.id = c.category_id
        LEFT JOIN instructors inst ON inst.id = c.instructor_id
        WHERE c.status != 'archived' AND c.status != 'draft'
        ORDER BY c.display_order ASC, c.id ASC
      `);
      return (rows || []).map(mapDbCourseRow);
    } catch (err) {
      console.error("Could not fetch published courses from MySQL:", err.message);
      return [];
    }
  }

  return [];
}

function withRelations(course) {
  if (!course) return null;
  const isClosed = isCourseClosed(course);

  let instructor = course.instructorRow;
  if (!instructor) {
    const fallback = {
      id: "aarav-mehta",
      name: "Aarav Mehta",
      title: "Lead AI Engineer & Mentor",
      bio: "Aarav is a former Staff ML Engineer who has built and scaled AI systems for millions of users.",
      rating: 4.9,
      learners: 14820,
      courses: 2,
    };
    instructor = fallback ? {
      ...fallback,
      bio: course.instructorBioOverride || fallback.bio,
    } : null;
  } else if (course.instructorBioOverride) {
    instructor = {
      ...instructor,
      bio: course.instructorBioOverride,
    };
  }

  return {
    ...course,
    isClosed,
    category: course.categoryRow ?? {
      slug: course.categorySlug,
      name: course.categorySlug?.replace(/-/g, " ") || "Tech",
      short: course.categorySlug?.toUpperCase() || "Tech",
      hue: 24,
      keywords: [],
    },
    instructor,
  };
}

function toArray(v) {
  if (!v) return [];
  return (Array.isArray(v) ? v : String(v).split(",")).filter(Boolean);
}

function score(course, q) {
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const terms = needle.split(/\s+/);
  const category = categoryBySlug.get(course.categorySlug);
  const haystacks = [
    [course.title || "", 5],
    [(course.tags || []).join(" "), 4],
    [category?.name ?? "", 3],
    [course.subtitle || "", 2],
    [course.shortDescription || "", 1],
  ];
  let total = 0;
  for (const term of terms) {
    let termScore = 0;
    for (const [text, weight] of haystacks) {
      if (text.toLowerCase().includes(term)) termScore += weight;
    }
    if (termScore === 0) return 0;
    total += termScore;
  }
  return total;
}

export async function getCourses(params = {}) {
  const {
    q = "",
    category,
    level,
    price,
    rating,
    sort = "default",
    page = 1,
    pageSize = PAGE_SIZE,
  } = params;

  const cats = toArray(category);
  const levels = toArray(level);
  const priceRange = PRICE_RANGES.find((r) => r.value === price);
  const minRating = Number(rating) || 0;

  const sourceCourses = await getSourceCourses();
  let list = sourceCourses.map((c) => ({ c, s: q ? score(c, q) : 0 }));
  if (q) list = list.filter((x) => x.s > 0);

  list = list.filter(({ c }) => {
    if (cats.length && !cats.includes(c.categorySlug)) return false;
    if (levels.length && !levels.includes(c.level)) return false;
    if (priceRange && !priceRange.test(c.price)) return false;
    if (minRating && c.rating < minRating) return false;
    return true;
  });

  const sorters = {
    default: () => 0, // keep admin-defined display order (sort is stable)
    popular: (a, b) => b.c.learners - a.c.learners,
    rating: (a, b) => b.c.rating - a.c.rating || b.c.reviewCount - a.c.reviewCount,
    newest: (a, b) => new Date(b.c.updatedAt) - new Date(a.c.updatedAt),
    "price-asc": (a, b) => a.c.price - b.c.price,
    "price-desc": (a, b) => b.c.price - a.c.price,
  };
  list.sort(q && sort === "default" ? (a, b) => b.s - a.s : sorters[sort] ?? sorters.default);

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const items = list
    .slice((current - 1) * pageSize, current * pageSize)
    .map(({ c }) => withRelations(c));

  return { items, total, page: current, pageSize, totalPages };
}

export async function getAllCourses() {
  const sourceCourses = await getSourceCourses();
  return sourceCourses.map(withRelations);
}

export async function getCourseBySlug(slug) {
  if (isDbConfigured()) {
    try {
      await ensureInstructorsTable();
      const rows = await query(
        `SELECT c.*, cat.id as category_id, cat.name as category_name, cat.slug as category_slug,
                cat.short_name as category_short_name, cat.icon as category_icon, 
                cat.description as category_description, cat.hue as category_hue, 
                cat.keywords as category_keywords,
                inst.name as inst_name, inst.title as inst_title, inst.bio as inst_bio,
                inst.rating as inst_rating, inst.learners as inst_learners, inst.image_url as inst_image_url
         FROM courses c
         LEFT JOIN categories cat ON cat.id = c.category_id
         LEFT JOIN instructors inst ON inst.id = c.instructor_id
         WHERE c.slug = ? LIMIT 1`,
        [slug]
      );
      if (rows && rows.length > 0) {
        return withRelations(mapDbCourseRow(rows[0]));
      }
      return null;
    } catch (err) {
      console.error("Could not fetch course by slug from MySQL:", err.message);
      return null;
    }
  }

  return null;
}

export async function getAllCourseSlugs() {
  if (isDbConfigured()) {
    try {
      const rows = await query("SELECT slug FROM courses WHERE status != 'archived'");
      return (rows || []).map((r) => r.slug);
    } catch (err) {
      console.error("Could not fetch course slugs from MySQL:", err.message);
      return [];
    }
  }
  return [];
}

export async function getFeaturedCourses(limit = 6) {
  const all = await getSourceCourses();
  return all.slice(0, limit).map(withRelations);
}

export async function getNewCourses(limit = 4) {
  const all = await getSourceCourses();
  return [...all]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
    .map(withRelations);
}

export async function getCoursesByCategory(categorySlug, limit) {
  const all = await getSourceCourses();
  const list = all.filter((c) => c.categorySlug === categorySlug).map(withRelations);
  return limit ? list.slice(0, limit) : list;
}

export async function getCoursesBySlugs(slugs) {
  const all = await getSourceCourses();
  return slugs
    .map((s) => all.find((c) => c.slug === s))
    .filter(Boolean)
    .map(withRelations);
}

export async function getRelatedCourses(course, limit = 3) {
  const all = await getSourceCourses();
  return all
    .filter((c) => c.slug !== course.slug)
    .map((c) => ({
      c,
      s:
        (c.categorySlug === course.categorySlug ? 10 : 0) +
        (course.tags || []).filter((t) => (c.tags || []).includes(t)).length * 2 +
        c.rating,
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ c }) => withRelations(c));
}

export async function searchCourses(q, limit = 6) {
  if (!q || q.trim().length < 2) return [];
  const all = await getSourceCourses();
  return all
    .map((c) => ({ c, s: score(c, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map(({ c }) => {
      const full = withRelations(c);
      return {
        slug: full.slug,
        title: full.title,
        price: full.price,
        originalPrice: full.originalPrice,
        level: full.level,
        categorySlug: full.categorySlug,
        categoryName: full.category?.short,
        rating: full.rating,
        imageUrl: full.imageUrl || null,
        isClosed: full.isClosed,
      };
    });
}

export async function getInstructors(limit) {
  if (isDbConfigured()) {
    try {
      await ensureInstructorsTable();
      const rows = await query(
        `SELECT inst.*, COUNT(c.id) as courses_count
         FROM instructors inst
         LEFT JOIN courses c ON c.instructor_id = inst.id
         GROUP BY inst.id
         ORDER BY inst.name ASC`
      );
      if (rows && rows.length > 0) {
        const list = rows.map((r) => ({
          id: r.id,
          name: r.name,
          title: r.title || "",
          bio: r.bio || "",
          rating: Number(r.rating) || 4.8,
          learners: Number(r.learners) || 0,
          courses: Number(r.courses_count) || 0,
          imageUrl: r.image_url || null,
        }));
        return limit ? list.slice(0, limit) : list;
      }
    } catch (e) {
      console.warn("Could not fetch instructors from DB:", e.message);
    }
  }
  return limit ? [] : [];
}
