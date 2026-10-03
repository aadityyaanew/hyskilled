import { getAdminBundles, getAdminCourses } from "@/services/admin.service";
import { BundlesManager } from "@/features/admin/bundles-manager";

export const metadata = {
  title: "Career Bundles | Admin",
};

export default async function AdminBundlesPage() {
  const [bundles, courses] = await Promise.all([
    getAdminBundles(),
    getAdminCourses(),
  ]);

  return <BundlesManager initialBundles={bundles} allCourses={courses} />;
}
