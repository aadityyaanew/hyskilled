"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  FileText,
  ExternalLink,
  Clock,
  Lock,
  Unlock,
  Image as ImageIcon,
  Trash2,
  Calendar,
  AlertTriangle,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CourseCountdown } from "@/components/shared/course-countdown";

function formatForDateTimeLocal(dateVal) {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CourseForm({ course = null, categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = Boolean(course?.id || course?.slug);
  const courseId = course?.id || course?.slug;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Drive & Cloudinary Upload States
  const [imageUploading, setImageUploading] = useState(false);
  const [syllabusUploading, setSyllabusUploading] = useState(false);

  const initialTags = Array.isArray(course?.tags)
    ? course.tags.join(", ")
    : typeof course?.tags === "string"
    ? course.tags
    : "AI, Python, Development";

  const initialOutcomes = Array.isArray(course?.outcomes)
    ? course.outcomes.join("\n")
    : "";

  const initialRequirements = Array.isArray(course?.requirements)
    ? course.requirements.join("\n")
    : "";

  const [formData, setFormData] = useState({
    title: course?.title || "",
    slug: course?.slug || "",
    subtitle: course?.subtitle || "",
    categorySlug: course?.category_slug || course?.categorySlug || categories[0]?.slug || "generative-ai",
    categoryId: course?.category_id || categories[0]?.id || 1,
    level: course?.level || "Beginner",
    durationHours: course?.duration_hours || course?.durationHours || 30,
    price: course?.price !== undefined ? course.price : 3999,
    originalPrice: course?.original_price !== undefined ? (course.original_price ?? "") : (course?.originalPrice ?? 7999),
    badge: course?.badge || "",
    tags: initialTags,
    shortDescription: course?.short_description || course?.shortDescription || "",
    description: course?.description || "",
    outcomes: initialOutcomes,
    requirements: initialRequirements,
    status: course?.status || "published",
    appCourseId: course?.app_course_id || course?.slug || "",
    // New Feature Fields
    imageUrl: course?.image_url || course?.imageUrl || course?.thumbnail || "",
    syllabusDriveFileId: course?.syllabus_drive_file_id || course?.syllabusDriveFileId || "",
    syllabusUrl: course?.syllabus_url || course?.syllabusUrl || "",
    closingDate: formatForDateTimeLocal(course?.closing_date || course?.closingDate),
    closingTimerEnabled: Boolean(course?.closing_timer_enabled ?? course?.closingTimerEnabled ?? false),
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedSlug = e.target.value;
    const cat = categories.find((c) => c.slug === selectedSlug);
    setFormData((prev) => ({
      ...prev,
      categorySlug: selectedSlug,
      categoryId: cat?.id || prev.categoryId,
    }));
  };

  // 1. Cloudinary Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validFormats = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif", "image/svg+xml"];
    if (!validFormats.includes(file.type.toLowerCase())) {
      setErrorMsg("Please select a valid image format (PNG, JPG, JPEG, WebP, GIF, or SVG).");
      return;
    }

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`);
      return;
    }

    setImageUploading(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "hyskilled_courses");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Failed to upload course image to Cloudinary.");
      }

      setFormData((prev) => ({ ...prev, imageUrl: json.url }));
      setSuccessMsg("Course image uploaded to Cloudinary successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload image.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  // 2. Google Drive Syllabus PDF Upload Handler
  const handleSyllabusFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const isPdfExt = /\.pdf$/i.test(file.name);
    const isPdfMime = file.type === "application/pdf" || file.type === "application/x-pdf";
    if (!isPdfExt && !isPdfMime) {
      setErrorMsg("Invalid file. The course syllabus must be an official PDF document (.pdf).");
      return;
    }

    // Validate size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg(`PDF size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 25MB limit.`);
      return;
    }

    setSyllabusUploading(true);
    setErrorMsg("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("courseSlug", formData.slug || formData.title || "course");

      const res = await fetch("/api/admin/courses/upload-syllabus", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to upload syllabus to Google Drive.");
      }

      setFormData((prev) => ({
        ...prev,
        syllabusDriveFileId: json.fileId,
        syllabusUrl: json.fileUrl,
      }));
      setSuccessMsg("Course syllabus uploaded to Google Drive successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload syllabus.");
    } finally {
      setSyllabusUploading(false);
      e.target.value = "";
    }
  };

  // Quick Action: Reopen course
  const handleReopenCourse = () => {
    // Extend or clear closing date and set status back to published
    setFormData((prev) => ({
      ...prev,
      status: "published",
      closingTimerEnabled: false,
      closingDate: "",
    }));
    setSuccessMsg("Course status set to Published. Save changes to reopen enrollments.");
  };

  const isCurrentlyClosed =
    formData.status === "closed" ||
    (formData.closingTimerEnabled &&
      formData.closingDate &&
      new Date(formData.closingDate).getTime() <= Date.now());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const parsedTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedOutcomes = formData.outcomes
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const parsedRequirements = formData.requirements
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice !== "" ? Number(formData.originalPrice) : null,
      durationHours: Number(formData.durationHours),
      tags: parsedTags,
      outcomes: parsedOutcomes,
      requirements: parsedRequirements,
      closingDate: formData.closingDate ? new Date(formData.closingDate).toISOString() : null,
      closingTimerEnabled: Boolean(formData.closingTimerEnabled),
    };

    try {
      const url = isEditing
        ? `/api/admin/courses/${courseId}`
        : "/api/admin/courses";

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? "update" : "create"} course.`);
      }

      setSuccessMsg(
        isEditing
          ? `Course "${formData.title}" updated successfully.`
          : `Course "${formData.title}" published successfully.`
      );

      // Return to courses catalog after a short delay
      setTimeout(() => {
        router.push("/admin/courses");
        router.refresh();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const currentPath = typeof window !== "undefined" ? window.location.pathname : `/admin/courses/${courseId || "new"}/edit`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to courses
        </Link>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/courses")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="brand" size="sm" disabled={loading || imageUploading || syllabusUploading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin size-4" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-4" /> {isEditing ? "Save Changes" : "Publish Course"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Closed State Banner */}
      {isCurrentlyClosed && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-destructive/30 bg-destructive/10 p-5 text-sm font-semibold text-destructive shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-destructive text-white shadow-xs">
              <Lock className="size-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">Course Enrollment Closed</p>
              <p className="text-xs text-muted-foreground font-normal">
                This course is marked as closed/expired. Students cannot purchase or enroll on the storefront.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReopenCourse}
            className="border-destructive/40 text-destructive hover:bg-destructive/15 shrink-0"
          >
            <Unlock className="size-4 mr-1.5" /> Reopen Course
          </Button>
        </div>
      )}

      {/* Inline Feedback Alerts */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive font-medium shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-destructive mt-0.5" />
          <div className="flex-1 min-w-0">{errorMsg}</div>
          <button
            type="button"
            onClick={() => setErrorMsg("")}
            className="text-destructive/70 hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium shadow-sm">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex-1 min-w-0">{successMsg}</div>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-emerald-600/70 hover:text-emerald-600"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* 1. Basic Details Card */}
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Course Information
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Course Title *
            </label>
            <Input
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Generative AI Engineering: Build Production LLM Apps"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Slug (URL Identifier)
            </label>
            <Input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="leave empty to auto-generate from title"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Unique identifier used in URLs, e.g. /courses/{formData.slug || "my-course"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Publishing Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
            >
              <option value="published">Published (Open for enrollment)</option>
              <option value="closed">Closed (Enrollment Closed)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Subtitle (Tagline)
            </label>
            <Input
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="e.g. Go from prompts to deployed RAG apps, agents and AI products."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Category *
            </label>
            <select
              name="categorySlug"
              value={formData.categorySlug}
              onChange={handleCategoryChange}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Skill Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Highlight Badge
            </label>
            <Input
              name="badge"
              value={formData.badge}
              onChange={handleChange}
              placeholder="e.g. Bestseller, New, Trending"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Mobile App Course ID
            </label>
            <Input
              name="appCourseId"
              value={formData.appCourseId}
              onChange={handleChange}
              placeholder="Sync ID for mobile learning app"
            />
          </div>
        </div>
      </div>

      {/* 2. Course Media & Cloudinary Image Upload Card */}
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Course Thumbnail & Banner (Cloudinary)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a course cover image. Uploaded securely to Cloudinary and used across all course cards, hero sections, and search results.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] font-semibold">
            Cloudinary Upload
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 items-start">
          {/* Upload Area */}
          <div className="space-y-3">
            <div className="relative rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors p-6 text-center bg-muted/20">
              <input
                type="file"
                id="course-image-file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleImageFileChange}
                disabled={imageUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                {imageUploading ? (
                  <>
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-xs font-semibold text-foreground">Uploading to Cloudinary…</p>
                  </>
                ) : (
                  <>
                    <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <ImageIcon className="size-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Click or drag image to upload
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        PNG, JPG, WebP or SVG up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-foreground mb-1">
                Or enter image URL directly:
              </label>
              <Input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/..."
                className="text-xs"
              />
            </div>
          </div>

          {/* Image Preview */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Image Preview
            </label>
            {formData.imageUrl ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-slate-900 shadow-sm group">
                <Image
                  src={formData.imageUrl}
                  alt={formData.title || "Course thumbnail"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={formData.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-md hover:bg-slate-100"
                  >
                    <ExternalLink className="size-3.5" /> View Full
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                    className="inline-flex items-center gap-1 rounded-xl bg-destructive px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-destructive/90"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-[16/10] w-full rounded-2xl border border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-4 text-center">
                <ImageIcon className="size-8 mb-2 opacity-40" />
                <p className="text-xs font-medium">No custom image uploaded yet.</p>
                <p className="text-[10px] text-muted-foreground/75 mt-0.5">
                  The generated procedural brand cover art will be used as fallback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Course Syllabus PDF Upload Card (Google Drive) */}
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Course Syllabus (PDF)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload the complete syllabus document as a PDF. Securely uploaded and stored directly on Google Drive.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex size-2 rounded-full bg-emerald-500" />
            Google Drive Storage
          </div>
        </div>

        {/* Upload dropzone for PDF */}
        <div className="space-y-4">
          <div className="relative rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors p-6 text-center bg-muted/20">
            <input
              type="file"
              id="course-syllabus-file"
              accept="application/pdf,.pdf"
              onChange={handleSyllabusFileChange}
              disabled={syllabusUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              {syllabusUploading ? (
                <>
                  <Loader2 className="size-8 text-primary animate-spin" />
                  <p className="text-xs font-semibold text-foreground">
                    Uploading syllabus PDF to Google Drive…
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Setting permissions and storing file reference
                  </p>
                </>
              ) : (
                <>
                  <div className="grid size-12 place-items-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                    <FileUp className="size-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Click or drag to upload syllabus PDF
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      PDF files only, up to 25MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Current Uploaded Syllabus File Details */}
          {formData.syllabusUrl ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  <FileText className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground truncate">
                      Course Syllabus (PDF)
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="size-3" /> Stored on Google Drive
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                    {formData.syllabusDriveFileId ? `File ID: ${formData.syllabusDriveFileId}` : "Google Drive Document"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <a
                  href={formData.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-xs"
                >
                  <ExternalLink className="size-3.5" /> View on Google Drive
                </a>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      syllabusUrl: "",
                      syllabusDriveFileId: "",
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="size-3.5" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-3 text-center text-xs text-muted-foreground">
              No syllabus PDF attached yet. Uploading a syllabus enables the "Download Syllabus" button on the course page.
            </div>
          )}
        </div>
      </div>

      {/* 4. Course Closing / Expiry Countdown Timer Card */}
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">
              Course Closing & Expiry Timer
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set a hard deadline for course registrations. Displays a live countdown timer on the storefront and automatically locks enrollment when expired.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="closingTimerEnabled"
                checked={formData.closingTimerEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-2 text-xs font-semibold text-foreground">
                {formData.closingTimerEnabled ? "Timer Enabled" : "Timer Disabled"}
              </span>
            </label>
          </div>
        </div>

        {formData.closingTimerEnabled && (
          <div className="space-y-5 rounded-2xl border border-brand-200 bg-brand-50/20 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Closing Date & Time *
                </label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    name="closingDate"
                    value={formData.closingDate}
                    onChange={handleChange}
                    required={formData.closingTimerEnabled}
                    className="text-xs sm:text-sm font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Select the exact date and time when registrations will close.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Live Timer Preview
                </label>
                <div className="rounded-xl border bg-background p-3 flex items-center justify-center min-h-[46px]">
                  {formData.closingDate ? (
                    <CourseCountdown
                      closingDate={formData.closingDate}
                      closingTimerEnabled={true}
                      isClosed={formData.status === "closed"}
                      variant="card"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Pick a date and time to preview live countdown
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Extension Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
              <span className="text-[11px] font-semibold text-muted-foreground">Quick Set:</span>
              {[
                { label: "+24 Hours", hours: 24 },
                { label: "+3 Days", hours: 72 },
                { label: "+7 Days", hours: 168 },
                { label: "+14 Days", hours: 336 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const d = new Date(Date.now() + preset.hours * 3600000);
                    setFormData((prev) => ({
                      ...prev,
                      closingDate: formatForDateTimeLocal(d),
                      closingTimerEnabled: true,
                    }));
                  }}
                  className="rounded-lg border border-input bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Pricing & Duration Card */}
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Pricing & Duration
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Selling Price (₹) *
            </label>
            <Input
              type="number"
              required
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Original Price (₹ MRP)
            </label>
            <Input
              type="number"
              min="0"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              placeholder="e.g. 7999"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Duration (Hours)
            </label>
            <Input
              type="number"
              min="1"
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* 6. Description & Curriculum Card */}
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Curriculum & Marketing Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Short Description (Marketing Card Summary)
            </label>
            <Textarea
              rows={2}
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Brief summary displayed on course card and search results..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Full Overview
            </label>
            <Textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed syllabus overview and what learners will achieve..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              What You'll Learn (Outcomes - one per line)
            </label>
            <Textarea
              rows={4}
              name="outcomes"
              value={formData.outcomes}
              onChange={handleChange}
              placeholder="Build RAG apps with vector databases&#10;Create tool-using AI agents&#10;Deploy and evaluate LLM products in production"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Requirements / Prerequisites (one per line)
            </label>
            <Textarea
              rows={3}
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Basic Python knowledge&#10;Familiarity with web APIs is helpful"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Tags (Comma separated)
            </label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. LLMs, RAG, LangChain, Agents, Python"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/courses")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="brand" disabled={loading || imageUploading || syllabusUploading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin size-4" /> Saving…
            </>
          ) : (
            <>
              <Save className="size-4" /> {isEditing ? "Save Changes" : "Publish Course"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
