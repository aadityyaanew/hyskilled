import { Award, BadgeCheck, Headphones, Infinity as InfinityIcon, RefreshCcw, Rocket, Smartphone, Target } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Target,
    title: "Career-focused curriculum",
    text: "Every syllabus is mapped to real job roles and built with working practitioners — not just theory.",
    span: "lg:col-span-2",
    accent: true,
  },
  {
    icon: Smartphone,
    title: "Learn on the go",
    text: "Your purchases unlock in the Hyskilled mobile app on iOS & Android.",
  },
  {
    icon: InfinityIcon,
    title: "Lifetime access",
    text: "Pay once and keep your course — including every future update.",
  },
  {
    icon: Rocket,
    title: "Portfolio projects",
    text: "Build real, shareable projects that prove your skills to employers.",
  },

  {
    icon: Headphones,
    title: "Friendly human support",
    text: "Questions before or after purchase? Our team replies within one business day.",
    span: "lg:col-span-2",
  },
];

export function WhyHyskilled() {
  return (
    <section className="section-y">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Why Hyskilled"
            title="Everything you need to upskill with confidence"
            description="We obsess over course quality, a smooth buying experience and a learning app that gets out of your way."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 80} className={cn(f.span)}>
              <div
                className={cn(
                  "group relative h-full overflow-hidden rounded-3xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
                  f.accent
                    ? "border-transparent bg-gradient-to-br from-brand-700 to-brand-950 text-white"
                    : "bg-card hover:border-brand-200"
                )}
              >
                {f.accent && (
                  <div aria-hidden className="absolute -right-10 -bottom-10 size-48 rounded-full bg-brand-400/30 blur-3xl" />
                )}
                <span
                  className={cn(
                    "relative grid size-12 place-items-center rounded-2xl",
                    f.accent ? "bg-white/15 text-white" : "bg-brand-50 text-primary"
                  )}
                >
                  <f.icon className="size-6" />
                </span>
                <h3 className={cn("relative mt-5 text-lg font-bold", f.accent ? "text-white" : "text-ink")}>
                  {f.title}
                </h3>
                <p className={cn("relative mt-2 text-sm leading-relaxed", f.accent ? "text-white/75" : "text-muted-foreground")}>
                  {f.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
