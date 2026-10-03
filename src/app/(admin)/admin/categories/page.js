import { getAdminCategories } from "@/services/admin.service";
import { CategoriesManager } from "@/features/admin/categories-manager";

export const metadata = {
  title: "Categories Management | Admin",
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return <CategoriesManager initialCategories={categories} />;
}
