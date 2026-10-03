import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { RatingStars } from "@/components/shared/rating-stars";
import { initials } from "@/lib/format";

function TestimonialCard({ t }) {
  return (
    <figure className="relative flex h-full flex-col rounded-3xl border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <Quote className="absolute top-6 right-6 size-8 text-brand-100" fill="currentColor" strokeWidth={0} />
      <RatingStars value={t.rating} size={16} />
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
  return (
    <section className="section-y">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            eyebrow="Learner stories"
            title="Loved by learners across every skill level"
            description="Real outcomes from people who invested in themselves with Hyskilled."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 90}>
              <TestimonialCard t={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
