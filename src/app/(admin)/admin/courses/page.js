import Link from "next/link";
import { Plus, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminCourses } from "@/services/admin.service";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Course Catalog Management | Admin",
};

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Course Catalog
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage course listings, pricing, syllabus outlines, and mobile app sync IDs.
          </p>
        </div>

        <Button asChild variant="brand" size="sm">
          <Link href="/admin/courses/new">
            <Plus className="size-4" /> Add New Course
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Level</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Learners</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((course) => (
                <tr key={course.slug} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <BookOpen className="size-4" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="truncate font-semibold text-foreground">
                          {course.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          /{course.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap capitalize text-muted-foreground">
                    {course.category_name || course.categorySlug}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                    {course.level}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-foreground">
                    {formatPrice(course.price)}
                    {course.originalPrice && (
                      <span className="ml-1.5 text-[11px] font-normal text-muted-foreground line-through">
                        {formatPrice(course.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-medium text-foreground">
                    {course.learners?.toLocaleString() || 0}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Badge variant={course.status === "published" ? "success" : "secondary"}>
                      {course.status || "published"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <Button asChild variant="ghost" size="xs">
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        View <ExternalLink className="size-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
