import { query, execute, isDbConfigured } from "./db.js";

let migrationPromise = null;

/**
 * Idempotently ensures the instructors table and extra courses columns exist.
 * Also seeds default instructors if table is empty.
 */
export async function ensureInstructorsTable() {
  if (!isDbConfigured()) return;

  if (!migrationPromise) {
    migrationPromise = (async () => {
      // 1. Ensure instructors table exists
      await execute(`
        CREATE TABLE IF NOT EXISTS instructors (
          id VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255) NULL,
          bio TEXT NULL,
          rating DECIMAL(3,2) NOT NULL DEFAULT 4.80,
          learners INT UNSIGNED NOT NULL DEFAULT 0,
          image_url VARCHAR(500) NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // 2. Ensure image_url column in instructors
      const instImageCol = await query(`
        SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'instructors' AND COLUMN_NAME = 'image_url'
      `);
      if (instImageCol.length === 0) {
        await execute(`ALTER TABLE instructors ADD COLUMN image_url VARCHAR(500) NULL AFTER learners`);
      }

      // 3. Ensure updated_at column in instructors
      const instUpdatedCol = await query(`
        SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'instructors' AND COLUMN_NAME = 'updated_at'
      `);
      if (instUpdatedCol.length === 0) {
        await execute(`
          ALTER TABLE instructors ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);
      }

      // 4. Ensure courses.language column exists
      const courseLangCol = await query(`
        SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'language'
      `);
      if (courseLangCol.length === 0) {
        await execute(`
          ALTER TABLE courses ADD COLUMN language VARCHAR(100) NOT NULL DEFAULT 'English' AFTER level
        `);
      }

      // 5. Ensure courses.instructor_bio_override column exists
      const courseBioCol = await query(`
        SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'instructor_bio_override'
      `);
      if (courseBioCol.length === 0) {
        await execute(`
          ALTER TABLE courses ADD COLUMN instructor_bio_override TEXT NULL AFTER instructor_id
        `);
      }

      // 6. Check if empty
      const [countResult] = await query("SELECT COUNT(*) as count FROM instructors");
      if (Number(countResult?.count || 0) === 0) {
        console.log("Instructors table is empty. Please add via Admin Panel.");
      }
    })().catch((err) => {
      migrationPromise = null;
      console.error("Migration error in ensureInstructorsTable:", err);
      throw err;
    });
  }

  return migrationPromise;
}
