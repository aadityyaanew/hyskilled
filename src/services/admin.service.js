import { query, execute, isDbConfigured } from "@/lib/db";
import { courses as mockCourses } from "@/data/courses";
import { categories as mockCategories } from "@/data/categories";
import { coupons as mockCoupons } from "@/data/coupons";

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
      const rows = await query(
        `SELECT c.*, cat.name as category_name, cat.slug as category_slug
         FROM courses c
         LEFT JOIN categories cat ON cat.id = c.category_id
         ORDER BY c.created_at DESC`
      );
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("Could not fetch courses from MySQL, using fallback:", err.message);
    }
  }

  return mockCourses.map((c) => ({
    ...c,
    category_name: c.categorySlug,
    status: "published",
  }));
}

export async function getAdminCategories() {
  if (isDbConfigured()) {
    try {
      const rows = await query(
        `SELECT cat.*, COUNT(c.id) as course_count
         FROM categories cat
         LEFT JOIN courses c ON c.category_id = cat.id
         GROUP BY cat.id
         ORDER BY cat.sort_order ASC`
      );
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn("Could not fetch categories from MySQL, using fallback:", err.message);
    }
  }

  return mockCategories.map((c, i) => ({
    ...c,
    id: i + 1,
    course_count: mockCourses.filter((x) => x.categorySlug === c.slug).length,
  }));
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
      if (coupons && coupons.length > 0) return coupons;
    } catch (err) {
      console.warn("Could not fetch coupons from MySQL, using fallback:", err.message);
    }
  }

  return mockCoupons.map((c, i) => ({
    id: i + 1,
    code: c.code,
    description: c.description,
    type: c.type,
    value: c.value,
    max_discount: c.maxDiscount || null,
    min_order: c.minOrder || null,
    is_active: 1,
    used_count: 0,
  }));
}
