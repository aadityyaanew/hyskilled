"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";

const DEFAULT_FORM = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  price: 7999,
  highlight: false,
  status: "published",
  sort_order: 0,
  courseIds: [],
};

export function BundlesManager({ initialBundles = [], allCourses = [] }) {
  const [bundles, setBundles] = useState(initialBundles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [modalError, setModalError] = useState("");

  const openCreateModal = () => {
    setEditingBundle(null);
    setFormData({
      ...DEFAULT_FORM,
      courseIds: allCourses.slice(0, 2).map((c) => c.id),
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (bundle) => {
    setEditingBundle(bundle);
    const existingIds = Array.isArray(bundle.courses)
      ? bundle.courses.map((c) => c.id || c.slug)
      : Array.isArray(bundle.courseIds)
      ? bundle.courseIds
      : [];

    setFormData({
      name: bundle.name || "",
      slug: bundle.slug || "",
      tagline: bundle.tagline || "",
      description: bundle.description || "",
      price: bundle.price || 0,
      highlight: Boolean(bundle.highlight),
      status: bundle.status || "published",
      sort_order: bundle.sort_order || 0,
      courseIds: existingIds,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const toggleCourseSelection = (courseId) => {
    setFormData((prev) => {
      const exists = prev.courseIds.includes(courseId);
      const nextIds = exists
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId];
      return { ...prev, courseIds: nextIds };
    });
  };

  // Calculate estimated total price of selected courses
  const selectedOriginalPrice = allCourses
    .filter((c) => formData.courseIds.includes(c.id) || formData.courseIds.includes(c.slug))
    .reduce((sum, c) => sum + Number(c.price || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.courseIds.length === 0) {
      setModalError("Please select at least one course to include in this bundle.");
      return;
    }

    setIsSubmitting(true);
    setModalError("");
    setFeedback({ type: "", message: "" });

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      sort_order: Number(formData.sort_order) || 0,
    };

    try {
      const url = editingBundle
        ? `/api/admin/bundles/${editingBundle.id || editingBundle.slug}`
        : "/api/admin/bundles";
      const method = editingBundle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save bundle.");
      }

      // Re-map selected courses for local state
      const includedCourses = allCourses
        .filter((c) => payload.courseIds.includes(c.id) || payload.courseIds.includes(c.slug))
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          price: Number(c.price),
        }));

      const origPrice = includedCourses.reduce((sum, c) => sum + c.price, 0);
      const savings = Math.max(0, origPrice - payload.price);

      if (editingBundle) {
        setBundles((prev) =>
          prev.map((b) =>
            b.id === editingBundle.id || b.slug === editingBundle.slug
              ? {
                  ...b,
                  ...payload,
                  slug: data.slug || b.slug,
                  courses: includedCourses,
                  originalPrice: origPrice,
                  savings,
                }
              : b
          )
        );
        setFeedback({
          type: "success",
          message: `Bundle "${formData.name}" updated successfully.`,
        });
      } else {
        setBundles((prev) => [
          {
            ...payload,
            id: data.id,
            slug: data.slug,
            courses: includedCourses,
            originalPrice: origPrice,
            savings,
          },
          ...prev,
        ]);
        setFeedback({
          type: "success",
          message: `Bundle "${formData.name}" created successfully.`,
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(
        `/api/admin/bundles/${deleteTarget.id || deleteTarget.slug}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete bundle.");
      }

      setBundles((prev) =>
        prev.filter((b) => b.id !== deleteTarget.id && b.slug !== deleteTarget.slug)
      );
      setFeedback({
        type: "success",
        message: `Bundle "${deleteTarget.name}" deleted successfully.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Career Bundles
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, manage pricing, and curate multi-course career tracks with special bundle discounts.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="brand" size="sm">
          <Plus className="size-4" /> Add New Bundle
        </Button>
      </div>

      {/* Global Inline Feedback (No Toast) */}
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

      {/* Grid of Bundles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <div
            key={bundle.id || bundle.slug}
            className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="size-5" />
                </span>
                <div className="flex items-center gap-1.5">
                  {bundle.highlight && (
                    <Badge variant="brand">Featured</Badge>
                  )}
                  <Badge variant={bundle.status === "published" ? "success" : "secondary"}>
                    {bundle.status || "published"}
                  </Badge>
                </div>
              </div>

              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
                {bundle.name}
              </h2>
              <p className="font-mono text-xs text-primary">/{bundle.slug}</p>
              {bundle.tagline && (
                <p className="mt-1 text-xs text-muted-foreground">{bundle.tagline}</p>
              )}

              {/* Included Courses list */}
              <div className="mt-4 rounded-2xl bg-muted/40 p-3.5 space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Included Courses ({bundle.courses?.length || 0})
                </p>
                {bundle.courses && bundle.courses.length > 0 ? (
                  bundle.courses.map((c) => (
                    <p key={c.id || c.slug} className="flex items-center gap-1.5 text-xs text-foreground">
                      <Check className="size-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{c.title}</span>
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No courses linked yet</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="font-heading text-xl font-bold text-foreground">
                    {formatPrice(bundle.price)}
                  </p>
                  {bundle.originalPrice && bundle.originalPrice > bundle.price ? (
                    <p className="text-xs text-muted-foreground line-through">
                      {formatPrice(bundle.originalPrice)}
                    </p>
                  ) : null}
                </div>
                {bundle.savings > 0 && (
                  <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Save {formatPrice(bundle.savings)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => openEditModal(bundle)}
                  className="gap-1.5 text-xs"
                >
                  <Edit className="size-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setDeleteTarget(bundle)}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingBundle ? "Edit Career Bundle" : "Create Career Bundle"}
              </DialogTitle>
              <DialogDescription>
                Bundle multiple courses together with a discounted price.
              </DialogDescription>
            </DialogHeader>

            {modalError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1">{modalError}</div>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Bundle Name *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. AI & Machine Learning Career Track"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Tagline
                  </label>
                  <Input
                    value={formData.tagline}
                    onChange={(e) => setFormData((p) => ({ ...p, tagline: e.target.value }))}
                    placeholder="e.g. From beginner to AI engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Slug (URL identifier)
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="auto-generated if empty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Bundle Price (₹) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((p) => ({ ...p, sort_order: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bundle-highlight"
                  checked={formData.highlight}
                  onChange={(e) => setFormData((p) => ({ ...p, highlight: e.target.checked }))}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
                <label htmlFor="bundle-highlight" className="text-xs font-medium text-foreground cursor-pointer">
                  Feature this bundle with a "Featured" badge on the storefront
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Description
                </label>
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Detailed explanation of what learners will master in this career track..."
                />
              </div>

              {/* Course Selection Area */}
              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground">
                    Included Courses ({formData.courseIds.length} selected)
                  </label>
                  {selectedOriginalPrice > 0 && (
                    <span className="text-xs text-muted-foreground">
                      Sum of individual courses:{" "}
                      <strong className="text-foreground">{formatPrice(selectedOriginalPrice)}</strong>
                    </span>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-border p-3 space-y-2 bg-muted/20">
                  {allCourses.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">No courses available.</p>
                  ) : (
                    allCourses.map((c) => {
                      const isSelected =
                        formData.courseIds.includes(c.id) || formData.courseIds.includes(c.slug);
                      return (
                        <div
                          key={c.id || c.slug}
                          onClick={() => toggleCourseSelection(c.id || c.slug)}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? "bg-primary/10 border border-primary/30 text-foreground font-semibold"
                              : "hover:bg-muted/60 text-muted-foreground border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <BookOpen className="size-4 shrink-0 text-primary" />
                            <span className="truncate">{c.title}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-medium text-foreground">{formatPrice(c.price)}</span>
                            <div
                              className={`grid size-4 place-items-center rounded border ${
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-input bg-background"
                              }`}
                            >
                              {isSelected && <Check className="size-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin size-4" /> Saving…
                  </>
                ) : editingBundle ? (
                  "Save Changes"
                ) : (
                  "Create Bundle"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Career Bundle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete bundle{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>? This action cannot be
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
                "Delete Bundle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
