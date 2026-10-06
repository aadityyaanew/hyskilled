"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  FileText,
  Lock,
  Unlock,
  Clock,
  GripVertical,
  ChevronUp,
  ChevronDown,
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
import { formatPrice, formatDate } from "@/lib/format";

export function CourseTable({ initialCourses = [], categories = [] }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reopeningId, setReopeningId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const filtered = courses.filter((c) => {
    const isClosed =
      c.status === "closed" ||
      Boolean(
        c.closing_timer_enabled &&
          c.closing_date &&
          new Date(c.closing_date).getTime() <= Date.now()
      );

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
      selectedStatus === "all"
        ? true
        : selectedStatus === "closed"
        ? isClosed
        : !isClosed && (c.status || "published") === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const filtersActive =
    searchTerm.trim() !== "" || selectedCategory !== "all" || selectedStatus !== "all";
  const canReorder = !filtersActive && !isSavingOrder && courses.length > 1;

  const persistOrder = async (next, previous) => {
    setCourses(next);
    setIsSavingOrder(true);
    setFeedback({ type: "", message: "" });
    try {
      const res = await fetch("/api/admin/courses/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((c) => c.id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save course order.");
      setFeedback({ type: "success", message: "Course order saved. Storefront updated." });
    } catch (err) {
      setCourses(previous);
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const moveCourse = (fromId, toIndex) => {
    const fromIndex = courses.findIndex((c) => c.id === fromId);
    if (fromIndex < 0 || toIndex < 0 || toIndex >= courses.length || fromIndex === toIndex) return;
    const next = [...courses];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    persistOrder(next, courses);
  };

  const handleDrop = (targetId) => {
    const id = dragId;
    setDragId(null);
    setOverId(null);
    if (!canReorder || id == null || id === targetId) return;
    moveCourse(id, courses.findIndex((c) => c.id === targetId));
  };

  const handleReopenCourse = async (course) => {
    const targetId = course.id || course.slug;
    setReopeningId(targetId);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(`/api/admin/courses/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reopen" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reopen course.");
      }

      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id || c.slug === course.slug
            ? {
                ...c,
                status: "published",
                closing_timer_enabled: 0,
                closing_date: null,
                isClosed: false,
              }
            : c
        )
      );

      setFeedback({
        type: "success",
        message: `Course "${course.title}" has been reopened and enrollment is active.`,
      });
      router.refresh();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setReopeningId(null);
    }
  };

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
      router.refresh();
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

      {/* Reorder hint */}
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
        {isSavingOrder ? (
          <>
            <Loader2 className="size-3.5 animate-spin text-primary" /> Saving new order…
          </>
        ) : (
          <>
            <GripVertical className="size-3.5" />
            {filtersActive
              ? "Clear search and filters to reorder courses."
              : "Drag rows (or use the arrows) to set the order shown on the homepage and courses page. Changes save automatically."}
          </>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-base sm:text-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-input bg-background px-3 py-2 text-base sm:text-sm"
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
            className="w-full sm:w-auto rounded-xl border border-input bg-background px-3 py-2 text-base sm:text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="closed">Closed / Expired</option>
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
                <th className="w-24 px-3 py-3.5">Order</th>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Level</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Learners</th>
                <th className="px-5 py-3.5">Status & Deadline</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No courses match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((course) => {
                  const isClosed =
                    course.status === "closed" ||
                    Boolean(
                      course.closing_timer_enabled &&
                        course.closing_date &&
                        new Date(course.closing_date).getTime() <= Date.now()
                    );
                  const imageUrl = course.image_url || course.imageUrl;
                  const syllabusUrl = course.syllabus_url || course.syllabusUrl;

                  return (
                    <tr
                      key={course.id || course.slug}
                      draggable={canReorder}
                      onDragStart={(e) => {
                        setDragId(course.id);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", String(course.id));
                      }}
                      onDragOver={(e) => {
                        if (!canReorder || dragId == null) return;
                        e.preventDefault();
                        if (overId !== course.id) setOverId(course.id);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleDrop(course.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverId(null);
                      }}
                      className={`transition-colors hover:bg-muted/30 ${
                        dragId === course.id ? "opacity-40" : ""
                      } ${
                        overId === course.id && dragId !== course.id
                          ? "bg-primary/10 shadow-[inset_0_2px_0_0_var(--color-primary,#6366f1)]"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex ${
                              canReorder ? "cursor-grab active:cursor-grabbing text-muted-foreground" : "text-muted-foreground/30"
                            }`}
                            title={
                              filtersActive
                                ? "Clear filters to reorder"
                                : "Drag to reorder"
                            }
                            aria-hidden="true"
                          >
                            <GripVertical className="size-4" />
                          </span>
                          <span className="w-5 text-center font-mono text-[11px] font-bold text-foreground">
                            {courses.indexOf(course) + 1}
                          </span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={!canReorder || courses.indexOf(course) === 0}
                              onClick={() => moveCourse(course.id, courses.indexOf(course) - 1)}
                              className="rounded text-muted-foreground hover:text-primary disabled:opacity-25"
                              aria-label={`Move ${course.title} up`}
                            >
                              <ChevronUp className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={!canReorder || courses.indexOf(course) === courses.length - 1}
                              onClick={() => moveCourse(course.id, courses.indexOf(course) + 1)}
                              className="rounded text-muted-foreground hover:text-primary disabled:opacity-25"
                              aria-label={`Move ${course.title} down`}
                            >
                              <ChevronDown className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border bg-slate-900 shadow-xs">
                              <Image
                                src={imageUrl}
                                alt={course.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                              <BookOpen className="size-5" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs">
                            <p className="truncate font-semibold text-foreground">
                              {course.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="truncate text-[11px] text-muted-foreground font-mono">
                                /{course.slug}
                              </span>
                              {syllabusUrl && (
                                <a
                                  href={syllabusUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-primary hover:underline"
                                  title="View uploaded Cloudflare R2 Syllabus"
                                >
                                  <FileText className="size-3" /> Syllabus
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                        <div className="font-medium text-foreground capitalize">
                          {course.category_name || course.categorySlug}
                        </div>
                        {course.instructor_id && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span className="text-primary font-medium font-mono text-[10px]">
                              Mentor: {course.instructor_id}
                            </span>
                          </div>
                        )}
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
                        <div className="space-y-1">
                          {isClosed ? (
                            <Badge variant="destructive" className="inline-flex items-center gap-1">
                              <Lock className="size-3" /> Closed
                            </Badge>
                          ) : (
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
                          )}

                          {course.closing_timer_enabled && course.closing_date && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                              <Clock className="size-3 text-amber-500" />
                              <span>
                                {isClosed ? "Expired: " : "Closes: "}
                                {formatDate(course.closing_date, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {isClosed && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleReopenCourse(course)}
                              disabled={reopeningId === (course.id || course.slug)}
                              title="Reopen course for enrollments"
                              className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                            >
                              {reopeningId === (course.id || course.slug) ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Unlock className="size-3.5 mr-1" /> Reopen
                                </>
                              )}
                            </Button>
                          )}
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
                  );
                })
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
