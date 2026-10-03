import { PageHeader } from "@/components/shared/page-header";
import { CatalogView } from "@/features/courses/catalog-view";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { getCategories } from "@/services/categories.service";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "All Courses",
  description:
    "Browse premium technology courses in AI, Data Science, Machine Learning, UI/UX Design, Web Development, Cloud and Cybersecurity. Filter by level, price and rating.",
  path: ROUTES.courses,
});

export default async function CoursesPage({ searchParams }) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        eyebrow="Course catalogue"
        title="Find the course that moves your career forward"
        description="Search and filter our library of career-focused tech courses. Buy once, learn anywhere in the Hyskilled app."
        breadcrumbs={[{ label: "Courses", href: ROUTES.courses }]}
      />
      <CatalogView searchParams={params} basePath={ROUTES.courses} categories={categories} />
      <CtaBanner />
    </>
  );
}
