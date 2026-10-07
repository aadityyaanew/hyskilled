import { query, execute, isDbConfigured } from "./db.js";

let migrationPromise = null;

/**
 * Idempotently ensures the enrollment_docs table exists.
 */
export async function ensureEnrollmentDocsTable() {
  if (!isDbConfigured()) return;

  if (!migrationPromise) {
    migrationPromise = (async () => {
      await execute(`
        CREATE TABLE IF NOT EXISTS enrollment_docs (
          id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          order_id VARCHAR(100) NOT NULL,
          user_id INT UNSIGNED NULL,

          -- Personal
          full_name VARCHAR(255) NOT NULL,
          father_name VARCHAR(255) NOT NULL,
          dob DATE NOT NULL,
          mobile VARCHAR(20) NOT NULL,
          email VARCHAR(255) NOT NULL,

          -- Address
          country VARCHAR(100) NOT NULL DEFAULT 'India',
          address TEXT NOT NULL,
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20) NOT NULL,

          -- Identity
          govt_id_type VARCHAR(50) NULL,
          govt_id_url VARCHAR(500) NULL,
          aadhaar_number VARCHAR(20) NULL,

          -- Academic
          highest_qualification VARCHAR(100) NOT NULL,
          institution_name VARCHAR(255) NULL,
          graduation_year VARCHAR(10) NULL,

          -- Current Status
          current_status VARCHAR(100) NULL,
          work_experience_years VARCHAR(20) NULL,
          current_company VARCHAR(255) NULL,

          -- Photo
          photo_url VARCHAR(500) NULL,

          -- Resume
          resume_url VARCHAR(500) NULL,

          -- Payment
          total_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
          paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
          balance DECIMAL(12,2) GENERATED ALWAYS AS (total_fee - paid_amount) STORED,
          payment_ref_id VARCHAR(255) NULL,
          receipt_url VARCHAR(500) NULL,

          -- Course selection
          selected_course VARCHAR(255) NULL,
          selected_category VARCHAR(255) NULL,

          -- Declaration
          declaration_agreed TINYINT(1) NOT NULL DEFAULT 0,
          digital_signature VARCHAR(255) NULL,

          -- Admin status
          status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
          admin_notes TEXT NULL,

          submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

          PRIMARY KEY (id),
          INDEX idx_order_id (order_id),
          INDEX idx_user_id (user_id),
          INDEX idx_email (email),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Safe column additions if table already exists from earlier run
      const safeAddColumn = async (colDef) => {
        try {
          await execute(`ALTER TABLE enrollment_docs ADD COLUMN ${colDef}`);
        } catch (_) {
          // Column likely already exists
        }
      };

      await safeAddColumn("marksheet_url VARCHAR(500) NULL");
      await safeAddColumn("percentage_cgpa VARCHAR(50) NULL");
      await safeAddColumn("designation VARCHAR(255) NULL");
      await safeAddColumn("payment_history VARCHAR(1000) NULL");
    })().catch((err) => {
      migrationPromise = null;
      console.error("Migration error in ensureEnrollmentDocsTable:", err);
      throw err;
    });
  }

  return migrationPromise;
}
