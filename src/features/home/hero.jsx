import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, CirclePlay, Briefcase, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroSearch } from "@/features/home/hero-search";
import { HeroVisual } from "@/features/home/hero-visual";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

const avatars = ["AR", "VS", "MI", "AD", "SQ"];

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

      <div className="container-page grid items-center gap-12 pt-10 pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-20 lg:pb-24">
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

          <h1 className="mt-6 text-[2.5rem] leading-[1.04] font-extrabold text-ink sm:text-6xl lg:text-[4.1rem]">
            Build in-demand tech skills that <span className="text-gradient">get you hired.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Master in-demand skills with expert-led courses in AI, Data Science, UI/UX, and Web Development. 
            Pay once, own it forever, and learn on the go with the {siteConfig.app.name}.
          </p>

          <div className="mt-8 max-w-xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:gap-2">
              {[
                { icon: CirclePlay, title: "Expert-Led", desc: "Live & Recorded" },
                { icon: Briefcase, title: "Hands-on", desc: "Real Projects" },
                { icon: Award, title: "Get Certified", desc: "Career Ready" },
                { icon: Users, title: "Job Support", desc: "Placement Guidance" },
              ].map((feature, i) => (
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

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
          </div>

          <div className="mt-8 flex flex-wrap gap-3 lg:hidden">
            <Button asChild variant="brand" size="lg">
              <Link href={ROUTES.courses}>
                Explore courses <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:150ms] max-lg:hidden">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
