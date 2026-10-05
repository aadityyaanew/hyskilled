import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CirclePlay, Briefcase, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/features/home/hero-search";
import { HeroVisual } from "@/features/home/hero-visual";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

const features = [
  { icon: CirclePlay, title: "Expert-Led", desc: "Live & Recorded" },
  { icon: Briefcase, title: "Hands-on", desc: "Real Projects" },
  { icon: Award, title: "Get Certified", desc: "Career Ready" },
  { icon: Users, title: "Job Support", desc: "Placement Guidance" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-white via-brand-50/60 to-white">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 -z-10 size-[34rem] rounded-full bg-brand-200/60 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-60 -left-40 -z-10 size-[26rem] rounded-full bg-brand-100/80 blur-3xl"
      />

      {/* ── MOBILE HERO (Dedicated Mobile UI/UX with heromobile.svg) ── */}
      <div className="container-page block lg:hidden pt-4 pb-12">
        <div className="animate-fade-up">
          {/* Announcement Pill */}
          <div className="flex justify-center xs:justify-start">
            <Link
              href={ROUTES.course("generative-ai-engineering-llm-apps")}
              className="focus-ring group inline-flex items-center gap-2 rounded-full border border-brand-200/90 bg-white/95 py-1 pr-3 pl-1 text-xs shadow-xs backdrop-blur-sm transition-colors hover:border-brand-300"
            >
              <Badge variant="default" className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold">
                New
              </Badge>
              <span className="font-semibold text-ink-soft">Generative AI Engineering is live</span>
              <ArrowRight className="size-3 text-primary transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Punchy Mobile Heading */}
          <h1 className="mt-3.5 text-[2.15rem] leading-[1.12] font-black text-ink tracking-tight text-center xs:text-left">
            Build in-demand tech skills that <span className="text-gradient">get you hired.</span>
          </h1>

          {/* Crisp Mobile Subheadline */}
          <p className="mt-2.5 text-[14px] xs:text-[15px] leading-relaxed text-muted-foreground text-center xs:text-left">
            Master in-demand skills in AI, Data Science, UI/UX, and Web Development. Pay once, learn on the go with the {siteConfig.app.name}.
          </p>

          {/* Central Mobile Visual Showcase (heromobile.svg) */}
          <div className="relative mx-auto my-4 w-full max-w-[320px] xs:max-w-[360px]">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 -z-10 rounded-full bg-gradient-to-b from-brand-400/25 via-brand-200/20 to-transparent blur-2xl"
            />
            <Image
              src="/brand/heromobile.svg"
              alt="Learn and grow with Hyskilled"
              width={768}
              height={1152}
              priority
              className="h-auto max-h-[380px] w-auto mx-auto object-contain drop-shadow-xl animate-float-slow"
            />
          </div>

          {/* Mobile Search & Primary Action */}
          <div className="space-y-3">
            <HeroSearch suggestions={["Generative AI", "Python", "UI/UX", "Next.js"]} />

            <Button asChild variant="brand" size="lg" className="w-full h-11 text-sm font-bold rounded-xl shadow-md shadow-brand-700/15">
              <Link href={ROUTES.courses}>
                Explore all courses <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Feature Badges Grid */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl border border-brand-100/90 bg-white/85 p-2.5 shadow-2xs backdrop-blur-xs transition-colors hover:border-brand-200"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <feature.icon className="size-4.5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-bold text-ink truncate">{feature.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP HERO (Side-by-side 2 columns with herodesktop.svg) ── */}
      <div className="container-page hidden lg:grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] pt-16 pb-20 lg:pt-20 lg:pb-24">
        <div className="animate-fade-up">
          <Link
            href={ROUTES.course("generative-ai-engineering-llm-apps")}
            className="focus-ring group inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white py-1 pr-3 pl-1 text-sm shadow-sm transition-colors hover:border-brand-300"
          >
            <Badge variant="default" className="bg-primary text-primary-foreground">
              New
            </Badge>
            <span className="font-medium text-ink-soft">Generative AI Engineering is live</span>
            <ArrowRight className="size-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold text-ink sm:text-6xl lg:text-[4.1rem]">
            Build in-demand tech skills that <span className="text-gradient">get you hired.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Master in-demand skills with expert-led courses in AI, Data Science, UI/UX, and Web Development. 
            Pay once, own it forever, and learn on the go with the {siteConfig.app.name}.
          </p>

          <div className="mt-8 max-w-xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-brand-50 text-brand-600">
                    <feature.icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-bold text-ink">{feature.title}</p>
                    <p className="text-[11px] text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <HeroSearch suggestions={["Generative AI", "Python", "UI/UX", "Next.js"]} />
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:150ms]">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
