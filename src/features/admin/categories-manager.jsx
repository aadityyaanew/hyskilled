"use client";

import { useState } from "react";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Tag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CategoryIcon } from "@/features/categories/category-icon";

const AVAILABLE_ICONS = [
  "Code2",
  "Zap",
  "BarChart3",
  "BrainCircuit",
  "PenTool",
  "Smartphone",
  "Cloud",
  "ShieldCheck",
  "Layers",
];

const DEFAULT_FORM = {
  name: "",
  slug: "",
  short_name: "",
  icon: "Code2",
  description: "",
  hue: 24,
  keywords: "",
  sort_order: 0,
};

export function CategoriesManager({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [modalError, setModalError] = useState("");

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(DEFAULT_FORM);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    const kw = Array.isArray(cat.keywords)
      ? cat.keywords.join(", ")
      : typeof cat.keywords === "string"
      ? cat.keywords
      : "";

    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      short_name: cat.short_name || cat.short || cat.name || "",
      icon: cat.icon || "Code2",
      description: cat.description || "",
      hue: cat.hue ?? 24,
      keywords: kw,
      sort_order: cat.sort_order ?? 0,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");
    setFeedback({ type: "", message: "" });

    const kwArray = formData.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      keywords: kwArray,
      hue: Number(formData.hue) || 24,
      sort_order: Number(formData.sort_order) || 0,
    };

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id || editingCategory.slug}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save category.");
      }

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id || c.slug === editingCategory.slug
              ? { ...c, ...payload, keywords: kwArray, slug: data.slug || c.slug }
              : c
          )
        );
        setFeedback({
          type: "success",
          message: `Category "${formData.name}" updated successfully.`,
        });
      } else {
        setCategories((prev) => [
          ...prev,
          {
            ...payload,
            id: data.id,
            slug: data.slug,
            course_count: 0,
            keywords: kwArray,
          },
        ]);
        setFeedback({
          type: "success",
          message: `Category "${formData.name}" created successfully.`,
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
        `/api/admin/categories/${deleteTarget.id || deleteTarget.slug}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete category.");
      }

      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id && c.slug !== deleteTarget.slug)
      );
      setFeedback({
        type: "success",
        message: `Category "${deleteTarget.name}" deleted successfully.`,
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
            Course Categories
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, edit, organize storefront filters, and configure visual styles for subject areas.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="brand" size="sm">
          <Plus className="size-4" /> Add Category
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

      {/* Grid of Categories */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div
            key={cat.id || cat.slug}
            className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <CategoryIcon name={cat.icon || "Code2"} className="size-5" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {cat.course_count || 0} courses
                  </span>
                </div>
              </div>

              <h2 className="mt-4 font-heading text-lg font-bold text-foreground">
                {cat.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-primary">/{cat.slug}</span>
                {cat.short_name && (
                  <span className="text-[11px] text-muted-foreground">({cat.short_name})</span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {cat.description || "No description provided."}
              </p>
            </div>

            <div>
              {/* Keywords */}
              {cat.keywords && (
                <div className="mt-4 flex flex-wrap gap-1 border-t border-border/60 pt-3">
                  {(Array.isArray(cat.keywords)
                    ? cat.keywords
                    : typeof cat.keywords === "string"
                    ? cat.keywords.split(",").map((k) => k.trim())
                    : []
                  ).map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      <Tag className="size-2.5 text-primary" /> {k}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => openEditModal(cat)}
                  className="gap-1.5 text-xs"
                >
                  <Edit className="size-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setDeleteTarget(cat)}
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
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? `Update the properties for "${editingCategory.name}".`
                  : "Create a new technology category for organizing courses."}
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
                  Category Name *
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Artificial Intelligence & ML"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Short Name (Navbar Label)
                  </label>
                  <Input
                    value={formData.short_name}
                    onChange={(e) => setFormData((p) => ({ ...p, short_name: e.target.value }))}
                    placeholder="e.g. AI & ML"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Category Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Color Hue (0 - 360)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="360"
                    value={formData.hue}
                    onChange={(e) => setFormData((p) => ({ ...p, hue: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Description
                </label>
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Summary shown on the storefront category cards..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Keywords / Tags (Comma separated)
                </label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData((p) => ({ ...p, keywords: e.target.value }))}
                  placeholder="e.g. LLM, RAG, PyTorch, Agents"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((p) => ({ ...p, sort_order: e.target.value }))}
                  placeholder="0"
                />
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
                ) : editingCategory ? (
                  "Save Changes"
                ) : (
                  "Create Category"
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
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete category{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>?
              {deleteTarget?.course_count > 0 && (
                <span className="block mt-2 font-semibold text-destructive">
                  Warning: This category currently has {deleteTarget.course_count} assigned course(s).
                  You must reassign or remove those courses before deleting this category.
                </span>
              )}
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
              disabled={isDeleting || deleteTarget?.course_count > 0}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin size-4" /> Deleting…
                </>
              ) : (
                "Delete Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
