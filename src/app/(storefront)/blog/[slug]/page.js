import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { BlogCard, formatBlogDate } from "@/features/blog/blog-card";
import { BlogContent } from "@/features/blog/blog-content";
import { getPublishedPostBySlug, getPublishedPosts } from "@/services/blogs.service";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Post not found", noIndex: true });
  return buildMetadata({
    title: post.title,
    description: post.short_description || undefined,
    path: ROUTES.blogPost(post.slug),
    image: post.featured_image || undefined,
    keywords: post.tags.length ? post.tags : undefined,
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = (await getPublishedPosts()).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <>
      <article className="section-y">
        <div className="container-page max-w-3xl">
          <Link
            href={ROUTES.blog}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> All articles
          </Link>

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {t}
                </span>
              ))}
            </div>
          )}

          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          {post.short_description && (
            <p className="mt-4 text-lg text-muted-foreground">{post.short_description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <User className="size-4 text-primary" /> {post.author}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" /> {formatBlogDate(post.publish_date)}
            </span>
          </div>

          {post.featured_image && (
            <div className="mt-8 aspect-video overflow-hidden rounded-3xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.featured_image} alt={post.title} className="size-full object-cover" />
            </div>
          )}

          <div className="mt-10">
            <BlogContent content={post.content} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section-y border-t border-border bg-muted/30">
          <div className="container-page">
            <h2 className="font-heading text-2xl font-bold text-foreground">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
