import { CreditCard, Search, Smartphone } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";

const steps = [
  {
    icon: Search,
    title: "Find your course",
    text: "Browse by category, compare outcomes, syllabus and reviews, and pick the course that fits your goal.",
  },
  {
    icon: CreditCard,
    title: "Buy securely online",
    text: "Pay with UPI, card, net banking or wallet. Instant confirmation and a GST invoice in your inbox.",
  },
  {
    icon: Smartphone,
    title: "Learn in the Hyskilled app",
    text: "Log in to the app with the same email and your course is already waiting — learn anywhere, anytime.",
  },
];

export function HowItWorks() {
  return (
    <section className="section-y bg-muted/40">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From enrollment to learning in minutes"
            description="No complicated setup. Purchase on the web, and your courses unlock instantly in the app."
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute top-12 right-[16%] left-[16%] hidden border-t-2 border-dashed border-brand-200 md:block"
          />
          {steps.map((s, i) => (
            <Reveal key={s.title} as="li" delay={i * 120} className="relative">
              <div className="relative flex h-full flex-col items-center rounded-3xl border bg-white p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
                  Step {i + 1}
                </span>
                <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-glow">
                  <s.icon className="size-9" />
                </span>
                <h3 className="mt-6 text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
