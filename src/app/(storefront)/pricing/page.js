import { BadgeCheck, Infinity as InfinityIcon, RefreshCcw, Smartphone, ReceiptText, Headphones } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { PricingSection } from "@/features/marketing/pricing-section";
import { FaqSection } from "@/features/marketing/faq-section";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { getBundles } from "@/services/bundles.service";
import { getFaqs } from "@/services/content.service";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Bundles & Pricing",
  description:
    "Transparent pricing with no subscriptions. Buy a single course or save up to 45% with a Hyskilled career-track bundle. Lifetime access in the app.",
  path: ROUTES.pricing,
});

const included = [
  { icon: Smartphone, title: "Instant app access", text: "Courses unlock in the Hyskilled app the moment payment is confirmed." },
  { icon: InfinityIcon, title: "Lifetime access", text: "Pay once. Keep it forever, including every future update." },
  { icon: RefreshCcw, title: siteConfig.guarantee.label, text: "Full refund within 7 days if the course isn't right for you." },
  { icon: ReceiptText, title: "GST invoice", text: "A tax-compliant invoice is emailed with every successful order." },
  { icon: BadgeCheck, title: "No subscriptions", text: "No recurring charges, no hidden fees, no surprises." },
  { icon: Headphones, title: "Human support", text: "Real people ready to help before and after you buy." },
];

export default async function PricingPage() {
  const [bundles, faqs] = await Promise.all([getBundles(), getFaqs({ group: "buying" })]);

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Simple pricing. Pay once, learn for life."
        description="No subscriptions. Buy a single course or save big with a curated career-track bundle."
        breadcrumbs={[{ label: "Bundles & Pricing", href: ROUTES.pricing }]}
      />
      <PricingSection
        bundles={bundles}
        heading={{
          eyebrow: "Career tracks",
          title: "Choose your learning path",
          description: "Each bundle groups the courses that work best together — at a lower price than buying separately.",
        }}
      />

      <section className="section-y">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Included with every purchase"
              title="Every course comes with the same promise"
            />
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {included.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 80}>
                <div className="flex h-full gap-4 rounded-3xl border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-primary">
                    <f.icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FaqSection faqs={faqs} />
      <CtaBanner />
    </>
  );
}
