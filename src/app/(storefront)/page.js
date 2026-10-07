import { Hero } from "@/features/home/hero";
import { SkillsMarquee } from "@/features/home/skills-marquee";
import { FeaturedCourses } from "@/features/home/featured-courses";
import { HowItWorks } from "@/features/home/how-it-works";
import { WhyHyskilled } from "@/features/home/why-hyskilled";
import { StatsBand } from "@/features/home/stats-band";
import { AppShowcase } from "@/features/home/app-showcase";
import { CategoryCard } from "@/features/categories/category-card";
import { PricingSection } from "@/features/marketing/pricing-section";
import { TestimonialsSection } from "@/features/marketing/testimonials-section";
import { CompaniesSection } from "@/features/home/companies-section";
import { FaqSection } from "@/features/marketing/faq-section";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { ScheduleSessionDialog } from "@/features/marketing/schedule-session-dialog";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { getCategories } from "@/services/categories.service";
import { getFeaturedCourses } from "@/services/courses.service";
import { getBundles } from "@/services/bundles.service";
import { getTestimonials, getFaqs } from "@/services/content.service";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  ...buildMetadata({ path: "/" }),
  title: { absolute: `${siteConfig.name} — Build What's Next.` },
};

export default async function HomePage() {
  const [categories, featured, bundles, testimonials, faqs] = await Promise.all([
    getCategories(),
    getFeaturedCourses(13),
    getBundles(),
    getTestimonials(6),
    getFaqs({ limit: 6 }),
  ]);

  return (
    <>
      <Hero />
      <SkillsMarquee />

      <section className="section-y">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Explore categories"
              title="Pick a path. Build a career."
              description="From AI to design to cloud — choose the field you want to grow in."
            />
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 4) * 70}>
                <CategoryCard category={c} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y bg-muted/40 pt-16">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Top courses"
              title="Learner-favourite courses"
              description="Hand-picked, highly rated programmes that learners love."
            />
          </Reveal>
          <div className="mt-12">
            <FeaturedCourses courses={featured} categories={categories} />
          </div>
        </div>
      </section>

      <HowItWorks />
      <StatsBand />
      <WhyHyskilled />
      <PricingSection bundles={bundles} />
      <AppShowcase />
      <TestimonialsSection testimonials={testimonials} />
      <CompaniesSection />
      <FaqSection faqs={faqs} />
      <CtaBanner />

      <ScheduleSessionDialog
        autoOpen={true}
        title="Get Free Counselling"
        description="Fill out the form below to book a free session with our career experts and find the right path for you."
        source="homepage_popup"
      >
        <span className="hidden" aria-hidden="true" />
      </ScheduleSessionDialog>
    </>
  );
}
