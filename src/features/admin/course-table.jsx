"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";

export function CourseTable({ initialCourses = [], categories = [] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const filtered = courses.filter((c) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategory === "all" ||
      String(c.category_id) === String(selectedCategory) ||
      c.categorySlug === selectedCategory ||
      c.category_slug === selectedCategory;

    const matchesStatus =
      selectedStatus === "all" || (c.status || "published") === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/admin/courses/${deleteTarget.id || deleteTarget.slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete course.");
      }

      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id && c.slug !== deleteTarget.slug));
      setFeedback({
        type: "success",
        message: `Course "${deleteTarget.title}" deleted successfully.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Feedback Banner (No Toast) */}
      {feedback.message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm font-medium shadow-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback({ type: "", message: "" })}
            className="opacity-70 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id || cat.slug} value={cat.id || cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Courses Table */}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No courses match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.id || course.slug} className="hover:bg-muted/30 transition-colors">
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
                      <Badge
                        variant={
                          course.status === "published"
                            ? "success"
                            : course.status === "draft"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {course.status || "published"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button asChild variant="ghost" size="xs" title="View Storefront Page">
                          <Link href={`/courses/${course.slug}`} target="_blank">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="xs" title="Edit Course">
                          <Link href={`/admin/courses/${course.id || course.slug}/edit`}>
                            <Edit className="size-3.5" /> Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(course)}
                          title="Delete Course"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">{deleteTarget?.title}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin size-4" /> Deleting…
                </>
              ) : (
                "Delete Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
