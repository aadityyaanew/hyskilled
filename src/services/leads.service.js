import { query, isDbConfigured } from "@/lib/db";

export const LEAD_STATUSES = ["new", "contacted", "scheduled", "converted", "closed"];

function toIso(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function mapLeadRow(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    course: row.course || "",
    notes: row.notes || "",
    status: row.status,
    admin_notes: row.admin_notes || "",
    source: row.source,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

export async function getAdminLeads() {
  if (!isDbConfigured()) return [];
  try {
    const rows = await query("SELECT * FROM leads ORDER BY created_at DESC");
    return rows.map(mapLeadRow);
  } catch (err) {
    console.error("getAdminLeads failed:", err);
    return [];
  }
}

export async function getCourseOptions() {
  if (!isDbConfigured()) return [];
  try {
    const rows = await query(
      "SELECT slug, title FROM courses WHERE status = 'published' ORDER BY title ASC"
    );
    return rows.map((r) => ({ slug: r.slug, title: r.title }));
  } catch (err) {
    console.error("getCourseOptions failed:", err);
    return [];
  }
}
