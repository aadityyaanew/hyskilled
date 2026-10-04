import db from "@/lib/db";

export async function getSetting(key, defaultValue = null) {
  if (!db.isDbConfigured()) return defaultValue;

  try {
    const rows = await db.query("SELECT value FROM settings WHERE `key` = ?", [key]);
    if (rows.length === 0) return defaultValue;
    return rows[0].value;
  } catch (err) {
    console.warn(`Could not fetch setting '${key}' from MySQL, using fallback:`, err.message);
    return defaultValue;
  }
}

export async function setSetting(key, value) {
  if (!db.isDbConfigured()) return;

  await db.execute(
    "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    [key, JSON.stringify(value)]
  );
}
