-- =============================================================================
-- Hyskilled — MySQL schema (MySQL 5.7+/8.x or MariaDB 10.4+)
-- Applied by `npm run db:setup` (idempotent: CREATE TABLE IF NOT EXISTS).
--
-- The `enrollments` table is the single source of truth for "who can access
-- which course". The Hyskilled mobile app backend can read it directly.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  google_id       VARCHAR(64)  NOT NULL,
  email           VARCHAR(191) NOT NULL,
  name            VARCHAR(120) NOT NULL,
  avatar_url      VARCHAR(500) NULL,
  phone           VARCHAR(15)  NULL,
  status          ENUM('active','suspended') NOT NULL DEFAULT 'active',
  admin_note      TEXT NULL,
  last_login_at   DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_google (google_id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug          VARCHAR(120) NOT NULL,
  name          VARCHAR(160) NOT NULL,
  short_name    VARCHAR(80)  NOT NULL,
  icon          VARCHAR(60)  NOT NULL DEFAULT 'Code2',
  description   TEXT NULL,
  hue           SMALLINT NOT NULL DEFAULT 24,
  keywords      JSON NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS instructors (
  id          VARCHAR(80)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  title       VARCHAR(160) NULL,
  bio         TEXT NULL,
  rating      DECIMAL(2,1) NOT NULL DEFAULT 0,
  learners    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug              VARCHAR(160) NOT NULL,
  title             VARCHAR(200) NOT NULL,
  subtitle          VARCHAR(300) NULL,
  category_id       INT UNSIGNED NOT NULL,
  instructor_id     VARCHAR(80)  NULL,
  level             ENUM('Beginner','Intermediate','Advanced','All Levels') NOT NULL DEFAULT 'Beginner',
  duration_hours    INT UNSIGNED NOT NULL DEFAULT 0,
  price             DECIMAL(10,2) NOT NULL,
  original_price    DECIMAL(10,2) NULL,
  rating            DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count      INT UNSIGNED NOT NULL DEFAULT 0,
  learners          INT UNSIGNED NOT NULL DEFAULT 0,
  badge             VARCHAR(40) NULL,
  tags              JSON NULL,
  short_description VARCHAR(500) NULL,
  description       TEXT NULL,
  outcomes          JSON NULL,
  requirements      JSON NULL,
  audience          JSON NULL,
  modules           JSON NULL,
  status            ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  app_course_id     VARCHAR(120) NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courses_slug (slug),
  KEY idx_courses_status (status),
  KEY idx_courses_category (category_id),
  CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES categories (id),
  CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES instructors (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bundles (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug         VARCHAR(160) NOT NULL,
  name         VARCHAR(160) NOT NULL,
  tagline      VARCHAR(255) NULL,
  description  TEXT NULL,
  price        DECIMAL(10,2) NOT NULL,
  highlight    TINYINT(1) NOT NULL DEFAULT 0,
  status       ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bundles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bundle_courses (
  bundle_id   INT UNSIGNED NOT NULL,
  course_id   INT UNSIGNED NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, course_id),
  CONSTRAINT fk_bc_bundle FOREIGN KEY (bundle_id) REFERENCES bundles (id) ON DELETE CASCADE,
  CONSTRAINT fk_bc_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code          VARCHAR(40) NOT NULL,
  description   VARCHAR(255) NOT NULL,
  type          ENUM('percent','flat') NOT NULL,
  value         DECIMAL(10,2) NOT NULL,
  max_discount  DECIMAL(10,2) NULL,
  min_order     DECIMAL(10,2) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  starts_at     DATETIME NULL,
  expires_at    DATETIME NULL,
  usage_limit   INT UNSIGNED NULL,
  used_count    INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_coupons_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id                  VARCHAR(32) NOT NULL,
  user_id             INT UNSIGNED NULL,
  customer_name       VARCHAR(120) NOT NULL,
  customer_email      VARCHAR(191) NOT NULL,
  customer_phone      VARCHAR(15)  NULL,
  status              ENUM('pending','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  currency            CHAR(3) NOT NULL DEFAULT 'INR',
  subtotal            DECIMAL(10,2) NOT NULL,
  list_total          DECIMAL(10,2) NOT NULL,
  discount            DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax                 DECIMAL(10,2) NOT NULL DEFAULT 0,
  net                 DECIMAL(10,2) NOT NULL DEFAULT 0,
  total               DECIMAL(10,2) NOT NULL,
  coupon_code         VARCHAR(40) NULL,
  coupon_description  VARCHAR(255) NULL,
  payment_method      VARCHAR(30) NULL,
  provider            VARCHAR(30) NOT NULL DEFAULT 'sandbox',
  payment_id          VARCHAR(120) NULL,
  failure_reason      VARCHAR(120) NULL,
  admin_note          TEXT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at             DATETIME NULL,
  refunded_at         DATETIME NULL,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_orders_user (user_id),
  KEY idx_orders_status_created (status, created_at),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id        VARCHAR(32) NOT NULL,
  item_type       ENUM('course','bundle') NOT NULL,
  item_slug       VARCHAR(160) NOT NULL,
  course_id       INT UNSIGNED NULL,
  bundle_id       INT UNSIGNED NULL,
  title           VARCHAR(200) NOT NULL,
  subtitle        VARCHAR(200) NULL,
  price           DECIMAL(10,2) NOT NULL,
  original_price  DECIMAL(10,2) NULL,
  category_slug   VARCHAR(120) NULL,
  PRIMARY KEY (id),
  KEY idx_oi_order (order_id),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enrollments (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     INT UNSIGNED NOT NULL,
  course_id   INT UNSIGNED NOT NULL,
  source      ENUM('order','manual') NOT NULL DEFAULT 'order',
  order_id    VARCHAR(32) NULL,
  status      ENUM('active','revoked') NOT NULL DEFAULT 'active',
  note        VARCHAR(255) NULL,
  granted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at  DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_enrollment (user_id, course_id),
  KEY idx_enrollments_order (order_id),
  CONSTRAINT fk_enr_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_enr_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
