import { BadgeCheck, CheckCircle2, Smartphone, Star } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { CourseCover } from "@/features/courses/course-cover";
import { cn } from "@/lib/utils";

const library = [
  { slug: "generative-ai-engineering-llm-apps", categorySlug: "generative-ai", title: "Generative AI Engineering", meta: "42 hrs · Intermediate" },
  { slug: "ui-ux-design-masterclass-figma", categorySlug: "ui-ux-design", title: "UI/UX Design Masterclass", meta: "40 hrs · Beginner" },
  { slug: "machine-learning-a-z-scikit-learn", categorySlug: "machine-learning", title: "Machine Learning A–Z", meta: "52 hrs · Intermediate" },
];

function FloatCard({ className, children, delay = "0s", slow = false }) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={cn(
        "absolute rounded-2xl border border-white/60 bg-white/90 p-3.5 shadow-lift backdrop-blur-xl",
        slow ? "animate-float-slow" : "animate-float",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Pure-CSS composition: the Hyskilled app library on a phone + floating proof cards. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[1/1.08] w-full max-w-[34rem]" aria-hidden>
      {/* backdrop */}
      <div className="absolute inset-x-6 inset-y-8 rounded-[3rem] bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 shadow-glow" />
      <div className="absolute inset-x-6 inset-y-8 overflow-hidden rounded-[3rem]">
        <div className="bg-grid-dark absolute inset-0 opacity-70" />
        <div className="absolute -top-16 -right-16 size-72 rounded-full bg-brand-300/30 blur-3xl" />
        <Logo mark tone="white" asLink={false} height={260} className="absolute -bottom-10 -left-12 opacity-[0.07]" />
      </div>

      {/* phone */}
      <div className="absolute top-1/2 left-1/2 w-[15.5rem] -translate-x-1/2 -translate-y-1/2 rotate-[4deg] rounded-[2.6rem] border-[7px] border-ink bg-white p-3 shadow-2xl sm:w-[16.5rem]">
        <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-ink" />
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground">Hyskilled App</p>
            <p className="font-heading text-base leading-tight font-bold text-ink">Your library</p>
          </div>
          <Logo mark asLink={false} height={30} />
        </div>
        <div className="mt-3 space-y-2.5">
          {library.map((c, i) => (
            <div
              key={c.slug}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border p-2",
                i === 0 ? "border-brand-200 bg-brand-50" : "bg-white"
              )}
            >
              <CourseCover course={c} size="xs" className="size-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] leading-tight font-bold text-ink">{c.title}</p>
                <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{c.meta}</p>
              </div>
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl bg-ink p-3 text-center text-[11px] font-semibold text-white">
          Open in app
        </div>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-ink/20" />
      </div>

      {/* floating proof cards */}
      <FloatCard className="top-4 -left-1 w-52 sm:-left-4" delay="0.3s">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
            <BadgeCheck className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Payment successful</p>
            <p className="text-[11px] text-muted-foreground">Course unlocked in app</p>
          </div>
        </div>
      </FloatCard>

      <FloatCard className="right-0 bottom-14 sm:-right-3" slow delay="1s">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-amber-500">
            <Star className="size-5" fill="currentColor" />
          </span>
          <div>
            <p className="font-heading text-lg leading-none font-bold text-ink">4.9 / 5</p>
            <p className="mt-1 text-[11px] text-muted-foreground">from 20,000+ reviews</p>
          </div>
        </div>
      </FloatCard>

      <FloatCard className="bottom-6 left-2 sm:-left-2" delay="1.6s">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-primary">
            <Smartphone className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Learn anywhere</p>
            <p className="text-[11px] text-muted-foreground">iOS &amp; Android</p>
          </div>
        </div>
      </FloatCard>
    </div>
  );
}
