# Hyskilled Web Architecture & Developer Guide

## 1. System Overview & Scope

**Hyskilled** is a modern, conversion-focused e-commerce storefront dedicated to selling high-impact technology courses (Artificial Intelligence, Data Science, Machine Learning, UI/UX, Web Development, and Cloud Engineering).

### Critical Scope Boundary: E-Commerce Storefront vs. Learning App
- **This Application handles:** Course marketing, category browsing, curriculum outlines, search & filtering, user authentication, cart management, coupons, secure checkout, payment gateway integration, GST tax calculations, and purchase receipts.
- **This Application is NOT an LMS:** It deliberately omits video players, quizzes, lesson progression, completion trackers, student community forums, and certificates.
- **Mobile Learning App Delivery:** Upon purchase confirmation, the customer's entitlements automatically unlock inside the native **Hyskilled Mobile App** (iOS / Android) under the email used during checkout.

---

## 2. Directory Structure

The repository follows a modular, feature-driven architecture engineered for long-term scalability:

```text
hyskilled/
├── public/
│   ├── brand/               # Scaled transparent brand logos & marks (from hylogo.jpeg)
│   │   ├── logo.png         # Full crimson brand logo
│   │   ├── logo-white.png   # Inverted white logo for dark surfaces
│   │   └── mark.png         # Isolated "HY" growth-arrow symbol mark
├── scripts/
│   └── build-brand-assets.mjs # Sharp script to regenerate transparent brand assets
├── src/
│   ├── app/                 # Next.js App Router route groups
│   │   ├── (auth)/          # Auth flows with split-screen branding (login, register, forgot-password)
│   │   ├── (checkout)/      # Minimal, distraction-free shell (checkout, order success/failed)
│   │   ├── (storefront)/    # Marketing layout (home, courses, categories, pricing, about, contact, faq, account, legal)
│   │   ├── api/             # Next.js Route Handlers (search, coupons, payments, health)
│   │   ├── globals.css      # OKLCH brand tokens, animation utilities, glassmorphism
│   │   ├── layout.js        # Root HTML shell, Outfit & Inter fonts, JSON-LD org schemas
│   │   ├── not-found.js     # Branded 404 page
│   │   ├── error.js         # Runtime error boundary
│   │   ├── sitemap.js       # Dynamic search engine sitemap
│   │   ├── robots.js        # Crawler rules & protected route exclusion
│   │   └── manifest.js      # PWA Web App Manifest
│   ├── components/
│   │   ├── layout/          # Mega-menu header, footer, announcement bar
│   │   ├── shared/          # Reusable domain-agnostic UI (Logo, PriceDisplay, RatingStars, Breadcrumbs, FormField)
│   │   └── ui/              # shadcn/ui primitive components (customized with brand tokens)
│   ├── config/              # Central site configuration, routes, roles, payment methods, env
│   ├── data/                # Strongly-typed mock catalog datasets (courses, categories, instructors, bundles, FAQs)
│   ├── features/            # Feature-sliced components & views
│   │   ├── auth/            # AuthProvider, LoginForm, RegisterForm, AccountView, UserMenu
│   │   ├── cart/            # CartProvider, CartDrawer, AddToCartButton, CouponForm, TotalsBreakdown
│   │   ├── categories/      # CategoryCard, CategoryIcon
│   │   ├── checkout/        # CheckoutView, PaymentMethodSelector, PaymentSandboxDialog
│   │   ├── contact/         # ContactForm
│   │   ├── courses/         # CourseCard, CourseCover, CatalogControls, CoursePurchaseCard, Syllabus
│   │   ├── home/            # Hero, SkillsMarquee, FeaturedCourses, HowItWorks, WhyHyskilled
│   │   ├── legal/           # LegalPageLayout
│   │   ├── marketing/       # BundleCard, PricingSection, FaqPageView, CtaBanner
│   │   ├── orders/          # OrderSummaryCard, OrderStatusBadge, useOrder, Success/Failed views
│   │   └── search/          # SearchDialog (⌘K)
│   ├── hooks/               # Custom React hooks (useStoredValue, useDebounce, useScrolled)
│   ├── lib/                 # Utility functions (formatters, catalog options, pricing math, SEO builders)
│   ├── providers/           # AppProviders root wrapper (Tooltip, Auth, Cart, Sonner Toaster)
│   ├── schemas/             # Zod validation schemas (forms.schema.js)
│   └── services/            # Server & client data access abstraction layer
│       ├── client/          # Client-side adapters (auth.client, orders.client, payments.client)
│       └── *.service.js     # Server-side domain services (courses, categories, bundles, coupons, orders)
└── docs/
    └── ARCHITECTURE.md      # This document
```

---

## 3. Future Admin Panel Integration Blueprint

The architecture was intentionally planned to accommodate a comprehensive **Hyskilled Admin Panel** (managing courses, categories, orders, coupons, users, and financial reports) without restructuring or breaking the storefront.

### Option A: Co-located Route Group inside this App (Recommended)
You can directly add an `(admin)` route group under `src/app/`:

```text
src/app/(admin)/
├── layout.js                # Admin sidebar, dark theme, topbar, breadcrumbs
└── admin/
    ├── page.js              # Business Analytics Overview (Revenue, orders, top courses)
    ├── courses/             # Course CRUD, module management, pricing editor
    │   ├── page.js
    │   ├── new/page.js
    │   └── [id]/page.js
    ├── categories/          # Category list & re-ordering
    ├── orders/              # Order tracking, payment verification, manual refund triggers
    ├── coupons/             # Discount code creator (% discount, flat discount, expiry)
    └── users/               # Customer list, role permissions
```

### Shared Assets Ready for the Admin Panel:
1. **Reserved Route Registry:** `src/config/routes.js` already exports `ROUTES.admin = { root: "/admin", ... }`.
2. **Role-Based Access Control (RBAC):** `src/config/roles.js` defines `ROLES.admin`, `ROLES.manager`, `PERMISSIONS`, and the `can(role, permission)` utility.
3. **Component Reusability:** All 27 shadcn/ui components (`Table`, `Dialog`, `DropdownMenu`, `Tabs`, `Select`, `Input`, `Badge`, `Switch`, `Sheet`, etc.) in `src/components/ui/` support both light and dark themes.
4. **Validation Schemas:** `src/schemas/forms.schema.js` can be imported on both admin forms and API routes for zero schema drift.

---

## 4. Data Layer & API Abstraction

All data fetching logic is isolated within the `src/services/` layer. Pages and UI components never call raw fetch requests or access mock arrays directly.

### Swapping Mock Data for Live Backend APIs
Every service function returns plain Promises. When your backend REST or GraphQL API is ready:
1. Set `NEXT_PUBLIC_API_URL=https://api.hyskilled.com` in your environment.
2. In `src/services/courses.service.js`, replace the internal array filter with:
   ```javascript
   import { backendApi } from "./api-client";

   export async function getCourses(params) {
     return backendApi.get("/courses", { params });
   }
   ```
3. Because UI components consume the exact same function signatures, **zero frontend components need to be edited**.

---

## 5. Payment Gateway & Checkout Architecture

### Provider Agnostic Adapter Pattern
Payment logic is abstracted in `src/services/client/payments.client.js` and `src/config/payments.js`. It supports three modes via `NEXT_PUBLIC_PAYMENT_PROVIDER`:

1. **`sandbox` (Default for Development):**
   - Launches an interactive modal (`PaymentSandboxDialog`) simulating real banking gateways.
   - Allows testing both **Payment Success** (triggering `/order/success`) and **Payment Failure** (triggering `/order/failed`) states without needing real API keys.
2. **`razorpay` (India / UPI / NetBanking / Cards):**
   - Pre-configured adapter ready for Razorpay standard checkout popup.
3. **`stripe` (International Credit / Debit Cards):**
   - Pre-configured adapter ready for Stripe Elements or Stripe Checkout.

### Re-Pricing & Security Assurance
- At checkout, the client only transmits item references (`{ type, slug }`) and the optional coupon code.
- Order calculations are calculated securely using catalog prices. Client price tampering is impossible.
- Indian GST (18%) is calculated on a tax-inclusive basis via `src/lib/pricing.js`.

---

## 6. Authentication & User State

- **Mock Implementation:** The current prototype uses `localStorage` via `src/services/client/auth.client.js` to enable immediate interactive testing of registration, login, logout, and profile updates.
- **Production Backend Swap:** To integrate with NextAuth, Supabase, Firebase, or custom JWT cookies, simply replace the methods inside `authService` in `src/services/client/auth.client.js`. The `<AuthProvider>` and `useAuth()` hook remain identical.

---

## 7. Design System & Aesthetics

- **Brand Crimson:** Tailored OKLCH colors (`--primary: oklch(0.52 0.22 25.8)` matching the crimson HY growth mark in `hylogo.jpeg`).
- **Typography:** Display headlines in **Outfit**; crisp body typography in **Inter**.
- **Aesthetic Depth:** Glassmorphic navigation headers, micro-animations (`animate-float`, `animate-pulse-ring`, `skeleton-shimmer`), modern gradient cards, and high-contrast dark accents.
- **Accessibility:** Semantic HTML5 landmarks, descriptive ARIA attributes, skip-to-content links, visible focus rings, and proper keyboard navigation on all dialogs and drawers.
