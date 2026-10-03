/**
 * Route registry. Always link through ROUTES so URL changes are one-line edits.
 * The `admin` namespace is reserved for the upcoming admin panel
 * (see docs/ARCHITECTURE.md).
 */
export const ROUTES = {
  home: "/",
  courses: "/courses",
  course: (slug) => `/courses/${slug}`,
  categories: "/categories",
  category: (slug) => `/categories/${slug}`,
  pricing: "/pricing",
  cart: "/cart",
  checkout: "/checkout",
  orderSuccess: (orderId) => `/order/success?order=${encodeURIComponent(orderId)}`,
  orderFailed: (orderId, reason) =>
    `/order/failed?order=${encodeURIComponent(orderId)}${
      reason ? `&reason=${encodeURIComponent(reason)}` : ""
    }`,
  login: (next) => (next ? `/login?next=${encodeURIComponent(next)}` : "/login"),
  register: (next) =>
    next ? `/register?next=${encodeURIComponent(next)}` : "/register",
  forgotPassword: "/forgot-password",
  account: "/account",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
  

  // Single Admin Panel
  admin: {
    root: "/admin",
    login: "/admin/login",
    courses: "/admin/courses",
    categories: "/admin/categories",
    bundles: "/admin/bundles",
    orders: "/admin/orders",
    students: "/admin/students",
    enrollments: "/admin/enrollments",
    coupons: "/admin/coupons",
  },
};

/** Routes that are rendered without the marketing header/footer. */
export const MINIMAL_LAYOUT_ROUTES = ["/checkout", "/order"];
