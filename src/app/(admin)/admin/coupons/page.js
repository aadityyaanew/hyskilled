import { getAdminCoupons } from "@/services/admin.service";
import { CouponsManager } from "@/features/admin/coupons-manager";

export const metadata = {
  title: "Coupons & Discounts | Admin",
};

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return <CouponsManager initialCoupons={coupons} />;
}
