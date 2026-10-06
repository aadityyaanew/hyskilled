"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Search,
  Star,
  Users,
  BookOpen,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Award,
  RefreshCw,
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
import { initials, formatNumber } from "@/lib/format";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";

const DEFAULT_FORM = {
  name: "",
  slug: "",
  title: "",
  bio: "",
  rating: 4.8,
  learners: 0,
  imageUrl: "",
};

export function InstructorsManager({ initialInstructors = [] }) {
  const [instructors, setInstructors] = useState(initialInstructors);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [modalError, setModalError] = useState("");

  const filteredInstructors = instructors.filter((inst) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inst.name?.toLowerCase().includes(q) ||
      inst.title?.toLowerCase().includes(q) ||
      inst.id?.toLowerCase().includes(q) ||
      inst.bio?.toLowerCase().includes(q)
    );
  });

  // Overview Stats
  const totalMentors = instructors.length;
  const totalLearners = instructors.reduce((sum, i) => sum + (Number(i.learners) || 0), 0);
  const totalCourses = instructors.reduce((sum, i) => sum + (Number(i.courses) || 0), 0);
  const avgRating = totalMentors > 0
    ? (instructors.reduce((sum, i) => sum + (Number(i.rating) || 4.8), 0) / totalMentors).toFixed(1)
    : "4.8";

  const openCreateModal = () => {
    setEditingInstructor(null);
    setFormData(DEFAULT_FORM);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (inst) => {
    setEditingInstructor(inst);
    setFormData({
      name: inst.name || "",
      slug: inst.id || "",
      title: inst.title || "",
      bio: inst.bio || "",
      rating: inst.rating ?? 4.8,
      learners: inst.learners ?? 0,
      imageUrl: inst.imageUrl || "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: editingInstructor ? prev.slug : slugify(nameVal),
    }));
  };

  // Cloudflare R2 Avatar Upload Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validFormats = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/svg+xml"];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setModalError("Please select a valid image format (PNG, JPG, WebP, GIF, or SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError("Avatar image must be under 5MB.");
      return;
    }

    setImageUploading(true);
    setModalError("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "hyskilled_instructors");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Failed to upload avatar image to Cloudflare R2.");
      }

      setFormData((prev) => ({ ...prev, imageUrl: json.url }));
      toast.success("Avatar uploaded successfully!");
    } catch (err) {
      setModalError(err.message || "Failed to upload avatar.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");
    setFeedback({ type: "", message: "" });

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || slugify(formData.name),
      title: formData.title.trim(),
      bio: formData.bio.trim(),
      rating: Number(formData.rating) || 4.8,
      learners: Number(formData.learners) || 0,
      imageUrl: formData.imageUrl?.trim() || null,
    };

    if (!payload.name) {
      setModalError("Instructor name is required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = editingInstructor
        ? `/api/admin/instructors/${editingInstructor.id}`
        : "/api/admin/instructors";
      const method = editingInstructor ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save instructor.");
      }

      if (editingInstructor) {
        setInstructors((prev) =>
          prev.map((i) =>
            i.id === editingInstructor.id
              ? {
                  ...i,
                  ...payload,
                  id: editingInstructor.id,
                  courses: i.courses,
                }
              : i
          )
        );
        toast.success(`Instructor "${payload.name}" updated successfully.`);
      } else {
        const newInstructor = {
          ...payload,
          id: payload.slug,
          courses: 0,
        };
        setInstructors((prev) => [newInstructor, ...prev]);
        toast.success(`Instructor "${payload.name}" created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err) {
      setModalError(err.message || "An error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/instructors/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete instructor.");
      }

      setInstructors((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      toast.success(`Instructor "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete instructor.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="size-5" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Instructors & Mentors
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, update, and manage instructor profiles assigned across Hyskilled course cards and detail pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal} variant="brand" className="shadow-sm">
            <Plus className="size-4" /> Add Instructor
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <GraduationCap className="size-4 text-primary" /> Total Mentors
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalMentors}</p>
          <p className="text-[11px] text-muted-foreground">Active in system</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Users className="size-4 text-emerald-500" /> Total Learners
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatNumber(totalLearners)}</p>
          <p className="text-[11px] text-muted-foreground">Mentored worldwide</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Star className="size-4 text-amber-500 fill-amber-500" /> Avg. Rating
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{avgRating} / 5.0</p>
          <p className="text-[11px] text-muted-foreground">Student satisfaction</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <BookOpen className="size-4 text-violet-500" /> Total Courses
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{totalCourses}</p>
          <p className="text-[11px] text-muted-foreground">Assigned to mentors</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by instructor name, title, or bio…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredInstructors.length}</span> of {instructors.length} instructors
        </div>
      </div>

      {/* Instructors Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredInstructors.map((inst) => (
          <div
            key={inst.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              {/* Header: Avatar, Name, Slug & Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {inst.imageUrl ? (
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                      <Image
                        src={inst.imageUrl}
                        alt={inst.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  ) : (
                    <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 font-heading text-sm font-bold text-white shadow-xs">
                      {initials(inst.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                      {inst.name}
                    </h3>
                    <p className="text-xs font-semibold text-primary truncate">
                      {inst.title || "Instructor"}
                    </p>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ID: {inst.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEditModal(inst)}
                    title="Edit Instructor"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setDeleteTarget(inst)}
                    title="Delete Instructor"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Badges / Stats */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {inst.rating ? Number(inst.rating).toFixed(1) : "4.8"}
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <Users className="size-3 text-emerald-600 dark:text-emerald-400" />
                  {formatNumber(inst.learners)} learners
                </span>

                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <BookOpen className="size-3" />
                  {inst.courses || 0} {inst.courses === 1 ? "course" : "courses"}
                </span>
              </div>

              {/* Bio overview */}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                {inst.bio || "No biography provided yet."}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-[11px]">
                {inst.courses > 0 ? (
                  <span className="text-foreground font-medium">Assigned in catalog</span>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => openEditModal(inst)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Edit Profile →
              </button>
            </div>
          </div>
        ))}

        {filteredInstructors.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border p-12 text-center bg-card">
            <GraduationCap className="mx-auto size-12 text-muted-foreground/50" />
            <h3 className="mt-3 text-base font-bold text-foreground">No instructors found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {searchQuery
                ? `No instructors match "${searchQuery}". Try a different search term.`
                : "No instructor profiles exist yet. Create your first instructor profile to assign them to courses."}
            </p>
            <Button onClick={openCreateModal} variant="brand" size="sm" className="mt-4">
              <Plus className="size-4" /> Add Instructor
            </Button>
          </div>
        )}
      </div>

      {/* CREATE & EDIT DIALOG */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold">
              {editingInstructor ? `Edit ${editingInstructor.name}` : "Add New Instructor"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Instructor profiles are selectable in course creation and displayed across storefront course cards and instructor overviews.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Aarav Mehta"
                  value={formData.name}
                  onChange={handleNameChange}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Unique Slug / ID *
                </label>
                <Input
                  required
                  disabled={Boolean(editingInstructor)}
                  placeholder="e.g. aarav-mehta"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                  }
                  className="font-mono text-xs"
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Used as the reference ID in courses. Cannot be changed after creation.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Professional Title / Headline *
              </label>
              <Input
                required
                placeholder="e.g. Senior AI Engineer & Tech Lead"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Student Rating (1.0 – 5.0)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, rating: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Learners Mentored
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 18400"
                  value={formData.learners}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, learners: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Profile Avatar Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Profile Photo / Avatar (Cloudflare R2)
              </label>

              <div className="flex items-center gap-4">
                {formData.imageUrl ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                    <Image
                      src={formData.imageUrl}
                      alt="Avatar preview"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 font-heading text-lg font-bold text-white">
                    {initials(formData.name || "Instructor")}
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <div className="relative inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={imageUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={imageUploading}
                      className="pointer-events-none text-xs"
                    >
                      {imageUploading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin mr-1.5" /> Uploading…
                        </>
                      ) : (
                        <>
                          <UploadCloud className="size-3.5 mr-1.5" /> Upload Avatar
                        </>
                      )}
                    </Button>
                  </div>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                      className="block text-[11px] text-destructive hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    Upload a high quality square portrait (PNG, JPG, WebP up to 5MB).
                  </p>
                </div>
              </div>

              <Input
                placeholder="Or paste direct image URL (optional)"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Biography / Professional Overview *
              </label>
              <Textarea
                required
                rows={4}
                placeholder="Describe the mentor's experience, company background, and teaching focus…"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
              />
            </div>

            {/* Live Preview Card */}
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Live Preview (How it looks on course page)
              </span>
              <div className="flex items-start gap-3">
                {formData.imageUrl ? (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                    <Image
                      src={formData.imageUrl}
                      alt={formData.name || "Instructor"}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-900 font-heading text-sm font-bold text-white shadow-glow">
                    {initials(formData.name || "Instructor")}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-foreground">
                    {formData.name || "Instructor Full Name"}
                  </h4>
                  <p className="text-xs font-semibold text-primary">
                    {formData.title || "Professional Title"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {formData.bio || "Biography description will appear here."}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting || imageUploading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={isSubmitting || imageUploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1.5" /> Saving…
                  </>
                ) : editingInstructor ? (
                  "Update Instructor"
                ) : (
                  "Create Instructor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" /> Delete Instructor Profile
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete{" "}
              <strong className="text-foreground font-semibold">"{deleteTarget?.name}"</strong>?
              {deleteTarget?.courses > 0 ? (
                <span className="block mt-2 text-destructive font-semibold">
                  ⚠️ Note: This instructor is currently assigned to {deleteTarget.courses} course(s). If deleted, those courses will need a new mentor assigned.
                </span>
              ) : (
                <span className="block mt-1">This action cannot be undone.</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" /> Deleting…
                </>
              ) : (
                "Delete Profile"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
