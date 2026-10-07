import { query, execute, isDbConfigured } from "@/lib/db";
import { ensureCourseOrderColumn } from "@/lib/course-order";
import { courses as mockCourses } from "@/data/courses";
import { categories as mockCategories } from "@/data/categories";
import { ensureInstructorsTable } from "@/lib/instructors-db";

/**
 * Admin Service: Raw SQL data layer for the Admin Panel.
 * No ORM used.
 */

export async function getDashboardStats() {
  if (isDbConfigured()) {
    try {
      const [revRows] = await query(
        "SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as total_orders FROM orders WHERE status = 'paid'"
      );
      const [allOrdersRows] = await query("SELECT COUNT(*) as count FROM orders");
      const [studentsRows] = await query("SELECT COUNT(*) as count FROM users");
      const [coursesRows] = await query("SELECT COUNT(*) as count FROM courses WHERE status = 'published'");
      const recentOrders = await query(
        "SELECT id, customer_name, customer_email, total, status, created_at, payment_method FROM orders ORDER BY created_at DESC LIMIT 8"
      );
      const topCourses = await query(
        `SELECT c.id, c.slug, c.title, c.price, c.learners, cat.name as category_name
         FROM courses c
         LEFT JOIN categories cat ON cat.id = c.category_id
         ORDER BY c.learners DESC LIMIT 5`
      );

      return {
        revenue: Number(revRows?.revenue || 0),
        paidOrders: Number(revRows?.total_orders || 0),
        totalOrders: Number(allOrdersRows?.count || 0),
        students: Number(studentsRows?.count || 0),
        courses: Number(coursesRows?.count || 0),
        recentOrders: recentOrders || [],
        topCourses: topCourses || [],
        isLiveDb: true,
      };
    } catch (err) {
      console.warn("Could not fetch dashboard stats from MySQL, using fallback:", err.message);
    }
  }

  // Graceful fallback when DB connection is being configured
  return {
    revenue: 148500,
    paidOrders: 28,
    totalOrders: 34,
    students: 12,
    courses: mockCourses.length,
    recentOrders: [
      {
        id: "HY-SAMPLE01",
        customer_name: "Rahul Verma",
        customer_email: "rahul@example.com",
        total: 4999,
        status: "paid",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        payment_method: "upi",
      },
      {
        id: "HY-SAMPLE02",
        customer_name: "Sneha Patel",
        customer_email: "sneha@example.com",
        total: 1499,
        status: "paid",
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        payment_method: "card",
      },
      {
        id: "HY-SAMPLE03",
        customer_name: "Ankit Roy",
        customer_email: "ankit@example.com",
        total: 3999,
        status: "pending",
        created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
        payment_method: "netbanking",
      },
    ],
    topCourses: mockCourses.slice(0, 5).map((c) => ({
      id: c.slug,
      slug: c.slug,
      title: c.title,
      price: c.price,
      learners: c.learners,
      category_name: c.categorySlug,
    })),
    isLiveDb: false,
  };
}

export async function getAdminCourses() {
  if (isDbConfigured()) {
    try {
      await ensureCourseOrderColumn();
      const rows = await query(
        `SELECT c.*, cat.name as category_name, cat.slug as category_slug
         FROM courses c
         LEFT JOIN categories cat ON cat.id = c.category_id
         ORDER BY c.display_order ASC, c.id ASC`
      );
      return (rows || []).map((r) => {
        let tags = [];
        try {
          tags = typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [];
        } catch {
          tags = [];
        }
        const closingDate = r.closing_date ? new Date(r.closing_date).toISOString() : null;
        const closingTimerEnabled = Boolean(r.closing_timer_enabled);
        const isClosed =
          r.status === "closed" ||
          Boolean(closingTimerEnabled && closingDate && new Date(closingDate).getTime() <= Date.now());

        return {
          ...r,
          price: Number(r.price),
          originalPrice: r.original_price ? Number(r.original_price) : null,
          durationHours: r.duration_hours,
          tags,
          syllabusDriveFileId: r.syllabus_drive_file_id || null,
          syllabusUrl: r.syllabus_url || null,
          imageUrl: r.image_url || null,
          closingDate,
          closingTimerEnabled,
          isClosed,
        };
      });
    } catch (err) {
      console.error("Could not fetch courses from MySQL:", err.message);
      return [];
    }
  }

  return [];
}

export async function getAdminCategories() {
  if (isDbConfigured()) {
    try {
      const rows = await query(
        `SELECT cat.*, COUNT(c.id) as course_count
         FROM categories cat
         LEFT JOIN courses c ON c.category_id = cat.id
         GROUP BY cat.id
         ORDER BY cat.sort_order ASC, cat.id ASC`
      );
      return (rows || []).map((cat) => {
        let keywords = [];
        try {
          keywords = typeof cat.keywords === "string" ? JSON.parse(cat.keywords) : cat.keywords || [];
        } catch {
          keywords = [];
        }
        return {
          ...cat,
          keywords,
          course_count: Number(cat.course_count) || 0,
        };
      });
    } catch (err) {
      console.error("Could not fetch categories from MySQL:", err.message);
      return [];
    }
  }

  return [];
}

export async function getAdminBundles() {
  if (isDbConfigured()) {
    try {
      const bundles = await query(
        `SELECT * FROM bundles ORDER BY sort_order ASC, created_at DESC`
      );

      if (bundles && bundles.length > 0) {
        const bundleCourses = await query(
          `SELECT bc.bundle_id, bc.sort_order, c.id, c.slug, c.title, c.price, c.duration_hours, c.level
           FROM bundle_courses bc
           JOIN courses c ON c.id = bc.course_id
           ORDER BY bc.sort_order ASC`
        );

        const map = new Map();
        for (const b of bundles) {
          map.set(b.id, {
            ...b,
            price: Number(b.price),
            highlight: Boolean(b.highlight),
            courses: [],
            courseIds: [],
            courseSlugs: [],
            originalPrice: 0,
            savings: 0,
          });
        }

        for (const bc of bundleCourses) {
          if (map.has(bc.bundle_id)) {
            const b = map.get(bc.bundle_id);
            const cPrice = Number(bc.price || 0);
            b.courses.push({
              id: bc.id,
              slug: bc.slug,
              title: bc.title,
              price: cPrice,
              durationHours: bc.duration_hours,
              level: bc.level,
            });
            b.courseIds.push(bc.id);
            b.courseSlugs.push(bc.slug);
            b.originalPrice += cPrice;
          }
        }

        for (const b of map.values()) {
          b.savings = Math.max(0, b.originalPrice - b.price);
        }

        return Array.from(map.values());
      }
    } catch (err) {
      console.warn("Could not fetch bundles from MySQL, using fallback:", err.message);
    }
  }

  // Fallback to mock bundles
  const { bundles: mockBundles } = await import("@/data/bundles");
  return mockBundles.map((b, i) => {
    const included = (b.courseSlugs || [])
      .map((slug) => mockCourses.find((c) => c.slug === slug))
      .filter(Boolean);
    const originalPrice = included.reduce((sum, c) => sum + c.price, 0);
    return {
      id: i + 1,
      slug: b.slug,
      name: b.name,
      tagline: b.tagline,
      description: b.description,
      price: b.price,
      highlight: b.highlight,
      status: "published",
      courses: included.map((c) => ({
        id: c.slug,
        slug: c.slug,
        title: c.title,
        price: c.price,
      })),
      courseIds: included.map((c) => c.slug),
      courseSlugs: included.map((c) => c.slug),
      originalPrice,
      savings: Math.max(0, originalPrice - b.price),
    };
  });
}

export async function getAdminOrders() {
  if (isDbConfigured()) {
    try {
      const orders = await query(
        "SELECT * FROM orders ORDER BY created_at DESC LIMIT 100"
      );
      return orders;
    } catch (err) {
      console.warn("Could not fetch orders from MySQL, using fallback:", err.message);
    }
  }

  return [];
}

export async function getAdminStudents() {
  if (isDbConfigured()) {
    try {
      const users = await query(
        `SELECT u.id, u.google_id, u.email, u.name, u.phone, u.status, u.avatar_url,
                u.created_at, u.last_login_at,
                COUNT(DISTINCT e.id) as enrolled_courses_count
         FROM users u
         LEFT JOIN enrollments e ON e.user_id = u.id AND e.status = 'active'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );
      return users;
    } catch (err) {
      console.warn("Could not fetch students from MySQL, using fallback:", err.message);
    }
  }

  return [];
}

export async function getAdminEnrollments() {
  if (isDbConfigured()) {
    try {
      const enrollments = await query(
        `SELECT e.id, e.user_id, e.course_id, e.source, e.order_id, e.status, e.granted_at,
                u.name as user_name, u.email as user_email, u.phone as user_phone,
                c.title as course_title, c.slug as course_slug, c.app_course_id
         FROM enrollments e
         JOIN users u ON u.id = e.user_id
         JOIN courses c ON c.id = e.course_id
         ORDER BY e.granted_at DESC`
      );
      return enrollments;
    } catch (err) {
      console.warn("Could not fetch enrollments from MySQL, using fallback:", err.message);
    }
  }

  return [];
}

export async function getAdminCoupons() {
  if (isDbConfigured()) {
    try {
      const coupons = await query("SELECT * FROM coupons ORDER BY created_at DESC");
      if (coupons && coupons.length > 0) {
        return coupons.map((c) => ({
          ...c,
          value: Number(c.value),
          max_discount: c.max_discount ? Number(c.max_discount) : null,
          min_order: c.min_order ? Number(c.min_order) : null,
          is_active: Boolean(c.is_active),
        }));
      }
    } catch (err) {
      console.warn("Could not fetch coupons from MySQL, using fallback:", err.message);
    }
  }

  return [];
}

export async function getAdminInstructors() {
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
      return (rows || []).map((r) => ({
        id: r.id,
        name: r.name,
        title: r.title || "",
        bio: r.bio || "",
        rating: Number(r.rating) || 4.8,
        learners: Number(r.learners) || 0,
        courses: Number(r.courses_count) || 0,
        imageUrl: r.image_url || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err) {
      console.warn("Could not fetch instructors from MySQL, using fallback:", err.message);
    }
  }

  const { instructors: mockInstructors } = await import("@/data/instructors");
  return mockInstructors.map((i) => ({
    ...i,
    imageUrl: null,
  }));
}

