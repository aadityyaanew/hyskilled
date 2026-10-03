import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminCourses, getAdminCategories } from "@/services/admin.service";
import { CourseTable } from "@/features/admin/course-table";

export const metadata = {
  title: "Course Catalog Management | Admin",
};

export default async function AdminCoursesPage() {
  const [courses, categories] = await Promise.all([
    getAdminCourses(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Course Catalog
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, update, manage curriculum, and configure mobile app sync IDs for all courses.
          </p>
        </div>

        <Button asChild variant="brand" size="sm">
          <Link href="/admin/courses/new">
            <Plus className="size-4" /> Add New Course
          </Link>
        </Button>
      </div>

      <CourseTable initialCourses={courses} categories={categories} />
    </div>
  );
}
