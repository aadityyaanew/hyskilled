import { siteConfig } from "@/config/site";
import { getAllCourseSlugs } from "@/services/courses.service";
import { getAllCategorySlugs } from "@/services/categories.service";
import { getPublishedPosts } from "@/services/blogs.service";

export default async function sitemap() {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // Static marketing routes
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/courses", priority: 0.9, changeFrequency: "daily" },
    { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.8, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.7, changeFrequency: "daily" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.4, changeFrequency: "monthly" },
    { path: "/refund-policy", priority: 0.4, changeFrequency: "monthly" },
  ].map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const [courseSlugs, categorySlugs, posts] = await Promise.all([
    getAllCourseSlugs(),
    getAllCategorySlugs(),
    getPublishedPosts(),
  ]);

  // Dynamic course pages
  const courseRoutes = courseSlugs.map((slug) => ({
    url: `${baseUrl}/courses/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic category pages
  const categoryRoutes = categorySlugs.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const blogRoutes = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes, ...categoryRoutes, ...blogRoutes];
}
