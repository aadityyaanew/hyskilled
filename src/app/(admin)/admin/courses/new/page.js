import { CourseForm } from "@/features/admin/course-form";
import { getAdminCategories } from "@/services/admin.service";

export const metadata = {
  title: "Create Course | Admin",
};

export default async function NewCoursePage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Add New Course
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Publish a new technology course to the Hyskilled storefront.
        </p>
      </div>

      <CourseForm categories={categories} />
    </div>
  );
}
