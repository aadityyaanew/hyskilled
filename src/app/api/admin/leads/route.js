import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-api";
import { getAdminLeads } from "@/services/leads.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;
  const leads = await getAdminLeads();
  return NextResponse.json({ success: true, leads });
}
