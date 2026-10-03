import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { CategoryCard } from "@/features/categories/category-card";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { getCategories } from "@/services/categories.service";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Course Categories",
  description:
    "Explore Hyskilled course categories: Generative AI, Data Science, Machine Learning, UI/UX Design, Web Development, Mobile Apps, Cloud & DevOps and Cybersecurity.",
  path: ROUTES.categories,
});

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Explore every skill path"
        description="Choose a field, compare courses and start learning in the Hyskilled app."
        breadcrumbs={[{ label: "Categories", href: ROUTES.categories }]}
      />
      <section className="container-page py-14 lg:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 4) * 70}>
              <CategoryCard category={c} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
