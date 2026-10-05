import { query, isDbConfigured } from "@/lib/db";

let ensurePromise = null;

/**
 * Idempotently makes sure `courses.display_order` exists. Existing databases
 * (created before this feature) are migrated on first use and backfilled
 * with a unique, contiguous 1..N order (previous order: newest first).
 */
export function ensureCourseOrderColumn() {
  if (!isDbConfigured()) return Promise.resolve();
  if (!ensurePromise) {
    ensurePromise = (async () => {
      const cols = await query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'display_order'`
      );
      if (cols.length > 0) return;
      await query(`ALTER TABLE courses ADD COLUMN display_order INT NOT NULL DEFAULT 0, ADD KEY idx_courses_display_order (display_order)`);
      await query(`SET @n := 0`);
      await query(
        `UPDATE courses c
         JOIN (SELECT id, (@n := @n + 1) AS rn FROM courses ORDER BY created_at DESC, id DESC) o ON o.id = c.id
         SET c.display_order = o.rn`
      );
    })().catch((err) => {
      ensurePromise = null;
      throw err;
    });
  }
  return ensurePromise;
}
