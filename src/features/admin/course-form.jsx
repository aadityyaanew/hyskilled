"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CourseForm({ course = null, categories = [] }) {
  const router = useRouter();
  const isEditing = Boolean(course?.id || course?.slug);
  const courseId = course?.id || course?.slug;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          <Button type="submit" variant="brand" size="sm" disabled={loading}>
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

      {successMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium shadow-sm">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex-1 min-w-0">{successMsg} Redirecting to catalog…</div>
        </div>
      )}

      {/* Basic Details Card */}
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
              <option value="published">Published</option>
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

      {/* Pricing & Duration */}
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

      {/* Description & Syllabus Overview */}
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
    </form>
  );
}
