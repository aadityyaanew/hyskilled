import { getAdminBlogPosts } from "@/services/blogs.service";
import { BlogsManager } from "@/features/admin/blogs-manager";

export const metadata = {
  title: "Blog Management | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await getAdminBlogPosts();
  return <BlogsManager initialPosts={posts} />;
}
