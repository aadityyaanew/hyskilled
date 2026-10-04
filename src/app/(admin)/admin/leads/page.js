import { getAdminLeads } from "@/services/leads.service";
import { LeadsManager } from "@/features/admin/leads-manager";

export const metadata = {
  title: "Leads | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await getAdminLeads();
  return <LeadsManager initialLeads={leads} />;
}
