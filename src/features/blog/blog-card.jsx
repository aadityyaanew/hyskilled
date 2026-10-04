import Link from "next/link";
import { ArrowRight, CalendarDays, User } from "lucide-react";
import { ROUTES } from "@/config/routes";

export function formatBlogDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function BlogCard({ post, featured = false }) {
  return (
    <Link
      href={ROUTES.blogPost(post.slug)}
      className={`group flex overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg ${
        featured ? "flex-col md:flex-row" : "flex-col"
      }`}
    >
      <div className={`relative aspect-video overflow-hidden bg-muted ${featured ? "md:w-3/5" : ""}`}>
        {post.featured_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featured_image}
            alt={post.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:justify-center md:p-8" : ""}`}>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                {t}
              </span>
            ))}
          </div>
        )}
        <h2
          className={`mt-3 line-clamp-2 font-heading font-bold text-foreground transition-colors group-hover:text-primary ${
            featured ? "text-2xl md:text-3xl" : "text-lg"
          }`}
        >
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.short_description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <User className="size-3.5" /> {post.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" /> {formatBlogDate(post.publish_date)}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-primary">
            Read more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
