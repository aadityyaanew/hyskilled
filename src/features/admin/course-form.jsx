"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CourseForm({ categories = [] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    categorySlug: categories[0]?.slug || "generative-ai",
    level: "Beginner",
    durationHours: 30,
    price: 3999,
    originalPrice: 7999,
    badge: "Popular",
    tags: "AI, Python, Development",
    shortDescription: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          originalPrice: Number(formData.originalPrice),
          durationHours: Number(formData.durationHours),
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create course.");
      }

      toast.success("Course created successfully!", {
        description: `Added "${formData.title}" to catalog.`,
      });
      router.push("/admin/courses");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to courses
        </Link>
        <Button type="submit" variant="brand" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="size-4" /> Publish Course
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Basic Details
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground mb-1.5">
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

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Subtitle
            </label>
            <Input
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="e.g. Go from prompts to deployed RAG apps, agents and AI products."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Category *
            </label>
            <select
              name="categorySlug"
              value={formData.categorySlug}
              onChange={handleChange}
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
            <label className="block text-xs font-medium text-foreground mb-1.5">
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
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Pricing & Duration
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Selling Price (₹) *
            </label>
            <Input
              type="number"
              required
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Original Price (₹ MRP)
            </label>
            <Input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Duration (Hours)
            </label>
            <Input
              type="number"
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <h2 className="font-heading text-lg font-bold text-foreground">
          Description & Tags
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Short Description (Marketing Summary)
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
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Full Overview
            </label>
            <Textarea
              rows={5}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed syllabus overview and what learners will achieve..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Tags (Comma separated)
            </label>
            <Input
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. LLMs, RAG, LangChain, Agents"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
