import { PageHeader } from "@/components/shared/page-header";
import { FaqPageView } from "@/features/marketing/faq-page-view";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { getFaqs, getFaqGroups } from "@/services/content.service";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Find answers to frequently asked questions about purchasing courses, Hyskilled mobile app access, refunds, and technical support.",
  path: ROUTES.faq,
});

export default async function FaqPage() {
  const [allFaqs, groups] = await Promise.all([getFaqs(), getFaqGroups()]);

  return (
    <>
      <PageHeader
        eyebrow="Help Center"
        title="Frequently Asked Questions"
        description="Everything you need to know about our courses, purchasing process, mobile app learning, and guarantees."
        breadcrumbs={[{ label: "FAQ", href: ROUTES.faq }]}
      />

      <section className="section-y">
        <div className="container-page max-w-4xl">
          <FaqPageView initialFaqs={allFaqs} groups={groups} />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
