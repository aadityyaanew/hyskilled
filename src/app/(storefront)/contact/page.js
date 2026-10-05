import { Mail, MapPin, Phone, Clock, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ContactForm } from "@/features/contact/contact-form";
import { FaqSection } from "@/features/marketing/faq-section";
import { getFaqs } from "@/services/content.service";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Have questions about our tech courses, syllabus, or mobile app access? Get in touch with the Hyskilled team.",
  path: ROUTES.contact,
});

export default async function ContactPage() {
  const faqs = await getFaqs({ group: "buying", limit: 4 });

  const contactCards = [
    {
      icon: Mail,
      title: "Email Support",
      value: siteConfig.contact.email,
      hint: "We usually reply within 24 hours",
      href: `mailto:${siteConfig.contact.email}`,
    },
    {
      icon: Phone,
      title: "Call / WhatsApp",
      value: siteConfig.contact.phone,
      hint: siteConfig.contact.hours,
      href: `tel:${siteConfig.contact.phone.replace(/[^+\d]/g, "")}`,
    },
    {
      icon: Clock,
      title: "Support Hours",
      value: siteConfig.contact.hours,
      hint: "IST (Indian Standard Time)",
    },
    {
      icon: MapPin,
      title: "Headquarters",
      value: siteConfig.contact.address,
      hint: siteConfig.legalName,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="We're here to help you skill up"
        description="Whether you have questions about our curriculum, need help choosing a course, or have billing inquiries, our team is ready."
        breadcrumbs={[{ label: "Contact Us", href: ROUTES.contact }]}
      />

      <section className="section-y">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
            <div>
              <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                Talk with our course advisors
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Looking to transition into Artificial Intelligence, Data Science, or Modern Fullstack
                Engineering? Reach out to find out which track matches your career goals.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {contactCards.map((c) => (
                  <div
                    key={c.title}
                    className="flex gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-brand-200"
                  >
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary">
                      <c.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">{c.title}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="font-bold text-ink hover:text-primary transition-colors block break-words"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="font-bold text-ink break-words">{c.value}</p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">{c.hint}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-brand-50/60 border border-brand-200 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-white">
                    <MessageSquare className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Already enrolled?</h3>
                    <p className="text-xs text-muted-foreground">
                      Remember your courses are accessed inside the {siteConfig.app.name}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <FaqSection faqs={faqs} />
    </>
  );
}
