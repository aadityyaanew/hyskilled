import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { initials } from "@/lib/format";

function TestimonialCard({ t }) {
  return (
    <figure className="relative flex h-full flex-col rounded-3xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <Quote className="absolute top-6 right-6 size-8 text-brand-100" fill="currentColor" strokeWidth={0} />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-soft">“{t.quote}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
        <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-800 text-sm font-bold text-white">
          {initials(t.name)}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-ink">{t.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {t.role}
            {t.courseTitle && <> · {t.courseTitle}</>}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection({ testimonials }) {
  // Split into two rows
  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  // Duplicate 4 times to ensure it covers large screens and loops seamlessly (since 50% translation is used)
  const row1Duplicated = [...row1, ...row1, ...row1, ...row1];
  const row2Duplicated = [...row2, ...row2, ...row2, ...row2];

  return (
    <section className="section-y overflow-hidden">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Learner stories"
            title="Loved by learners across every skill level"
            description="Real outcomes from people who invested in themselves with Hyskilled."
          />
        </Reveal>
      </div>

      <div className="mt-14 flex flex-col gap-6 relative [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]">
        {/* Row 1 - Reverse Marquee (Left to Right) */}
        <div className="flex w-max animate-marquee-reverse gap-6 pause-on-hover">
          {row1Duplicated.map((t, i) => (
            <div key={`r1-${t.id}-${i}`} className="w-[300px] sm:w-[350px] lg:w-[400px] shrink-0">
               <TestimonialCard t={t} />
            </div>
          ))}
        </div>

        {/* Row 2 - Normal Marquee (Right to Left) */}
        <div className="flex w-max animate-marquee gap-6 pause-on-hover">
          {row2Duplicated.map((t, i) => (
            <div key={`r2-${t.id}-${i}`} className="w-[300px] sm:w-[350px] lg:w-[400px] shrink-0">
               <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
