import { PageHeader } from "@/components/shared/page-header";
import { BlogCard } from "@/features/blog/blog-card";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { getPublishedPosts } from "@/services/blogs.service";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Blog",
  description:
    "Insights, tutorials and career guidance on AI, Data Science, Machine Learning, UI/UX and Web Development from the Hyskilled team.",
  path: ROUTES.blog,
});

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const [first, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Learn, grow and stay ahead"
        description="Practical articles, tutorials and career insights from the Hyskilled team."
        breadcrumbs={[{ label: "Blog", href: ROUTES.blog }]}
      />

      <section className="section-y">
        <div className="container-page">
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center">
              <h2 className="font-heading text-xl font-bold text-foreground">No articles yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">New posts are coming soon. Check back shortly!</p>
            </div>
          ) : (
            <div className="space-y-8">
              <BlogCard post={first} featured />
              {rest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
