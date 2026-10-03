import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { JsonLd } from "@/components/shared/json-ld";
import { faqJsonLd } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

/** Accordion list of FAQs (also emits FAQPage JSON-LD). */
export function FaqAccordion({ faqs, className }) {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <Accordion type="single" collapsible className={className}>
        {faqs.map((f) => (
          <AccordionItem
            key={f.id}
            value={f.id}
            className="mb-3 rounded-2xl border bg-card px-5 transition-colors last:mb-0 data-[state=open]:border-brand-200 data-[state=open]:bg-brand-50/40"
          >
            <AccordionTrigger className="py-5 text-left text-base font-semibold text-ink hover:no-underline">
              {f.question}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
              {f.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}

export function FaqSection({ faqs }) {
  return (
    <section className="section-y bg-muted/40">
      <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Questions? We've got answers."
            description="Everything you need to know about buying and learning with Hyskilled."
          />
          <div className="mt-8 flex items-center gap-4 rounded-2xl border bg-white p-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary">
              <MessageCircle className="size-6" />
            </span>
            <div>
              <p className="font-bold text-ink">Still have questions?</p>
              <Link href={ROUTES.contact} className="focus-ring inline-flex items-center gap-1 rounded text-sm font-semibold text-primary hover:underline">
                Talk to our team <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <FaqAccordion faqs={faqs} />
          <div className="mt-6 text-right">
            <Button asChild variant="ghost">
              <Link href={ROUTES.faq}>
                View all FAQs <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
