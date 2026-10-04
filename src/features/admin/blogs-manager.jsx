"use client";

import { useRef, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ImagePlus,
  ExternalLink,
  Search,
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

const DEFAULT_FORM = {
  title: "",
  slug: "",
  featured_image: "",
  short_description: "",
  content: "",
  author: "Hyskilled Team",
  tags: "",
  status: "draft",
  publish_date: "",
};

/** ISO -> value for <input type="datetime-local"> (local time). */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const labelCls = "block text-xs font-semibold text-foreground mb-1.5";

export function BlogsManager({ initialPosts = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [modalError, setModalError] = useState("");
  const fileRef = useRef(null);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const openCreate = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEdit = (post) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      featured_image: post.featured_image || "",
      short_description: post.short_description || "",
      content: post.content || "",
      author: post.author || "",
      tags: (post.tags || []).join(", "),
      status: post.status,
      publish_date: toLocalInput(post.publish_date),
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setModalError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setForm((p) => ({ ...p, featured_image: data.url }));
    } catch (err) {
      setModalError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");
    setFeedback({ type: "", message: "" });

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      publish_date: form.publish_date ? new Date(form.publish_date).toISOString() : null,
    };

    try {
      const res = await fetch(editing ? `/api/admin/blogs/${editing.id}` : "/api/admin/blogs", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save post.");

      // Re-fetch the saved record so list reflects server-normalized values.
      const id = editing ? editing.id : data.id;
      const fresh = await fetch(`/api/admin/blogs/${id}`).then((r) => r.json());
      if (fresh.post) {
        setPosts((prev) =>
          editing ? prev.map((p) => (p.id === id ? fresh.post : p)) : [fresh.post, ...prev]
        );
      }
      setFeedback({
        type: "success",
        message: `Post "${form.title}" ${editing ? "updated" : "created"} successfully.`,
      });
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (post) => {
    setTogglingId(post.id);
    setFeedback({ type: "", message: "" });
    const next = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status.");
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)));
      setFeedback({
        type: "success",
        message: `"${post.title}" ${next === "published" ? "published" : "unpublished"}.`,
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete post.");
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setFeedback({ type: "success", message: `Post "${deleteTarget.title}" deleted.` });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  const visible = posts.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      (!search || p.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Blog Posts</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, edit, publish and unpublish articles shown on the storefront blog.
          </p>
        </div>
        <Button onClick={openCreate} variant="brand" size="sm">
          <Plus className="size-4" /> New Post
        </Button>
      </div>

      {feedback.message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-medium shadow-sm sm:text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
          )}
          <div className="flex-1">{feedback.message}</div>
          <button type="button" onClick={() => setFeedback({ type: "", message: "" })} className="opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" className="pl-9" />
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {["all", "published", "draft"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No blog posts found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((post) => {
            const published = post.status === "published";
            return (
              <div key={post.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-colors hover:border-primary/40">
                <div className="relative aspect-video bg-muted">
                  {post.featured_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.featured_image} alt={post.title} className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-muted-foreground">
                      <ImagePlus className="size-8" />
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      published ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                    }`}
                  >
                    {published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 font-heading text-base font-bold text-foreground">{post.title}</h2>
                  <p className="mt-1 font-mono text-xs text-primary">/{post.slug}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {post.short_description || "No description."}
                  </p>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {post.author} · {formatDate(post.publish_date)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                    <Button variant="outline" size="xs" onClick={() => openEdit(post)} className="gap-1.5 text-xs">
                      <Edit className="size-3.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={togglingId === post.id}
                      onClick={() => toggleStatus(post)}
                      className="gap-1.5 text-xs"
                    >
                      {togglingId === post.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : published ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                      {published ? "Unpublish" : "Publish"}
                    </Button>
                    {published && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="size-3.5" /> View
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setDeleteTarget(post)}
                      className="ml-auto gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Blog Post" : "New Blog Post"}</DialogTitle>
              <DialogDescription>
                Content supports simple formatting: <code>## Heading</code>, <code>- list item</code>, and blank lines between paragraphs.
              </DialogDescription>
            </DialogHeader>

            {modalError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div className="flex-1">{modalError}</div>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label className={labelCls}>Title *</label>
                <Input required value={form.title} onChange={set("title")} placeholder="Post title" />
              </div>

              <div>
                <label className={labelCls}>Featured Image (16:9)</label>
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
                  {form.featured_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.featured_image} alt="Preview" className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-xs text-muted-foreground">
                      Recommended 1280×720 (16:9)
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 grid place-items-center bg-background/70">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                    <ImagePlus className="size-4" /> Upload from device
                  </Button>
                  {form.featured_image && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setForm((p) => ({ ...p, featured_image: "" }))}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>Short Description</label>
                <Textarea rows={2} maxLength={500} value={form.short_description} onChange={set("short_description")} placeholder="Summary shown on blog cards…" />
              </div>

              <div>
                <label className={labelCls}>Full Content</label>
                <Textarea rows={12} value={form.content} onChange={set("content")} placeholder="Write your article…" className="font-mono text-xs" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Author</label>
                  <Input value={form.author} onChange={set("author")} />
                </div>
                <div>
                  <label className={labelCls}>Slug (auto if empty)</label>
                  <Input value={form.slug} onChange={set("slug")} placeholder="my-first-post" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Tags (comma separated)</label>
                <Input value={form.tags} onChange={set("tags")} placeholder="AI, Career, Web Development" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={form.status}
                    onChange={set("status")}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Publish Date</label>
                  <Input type="datetime-local" value={form.publish_date} onChange={set("publish_date")} />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={isSubmitting || uploading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Saving…
                  </>
                ) : editing ? (
                  "Save Changes"
                ) : (
                  "Create Post"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Permanently delete <strong className="text-foreground">{deleteTarget?.title}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
