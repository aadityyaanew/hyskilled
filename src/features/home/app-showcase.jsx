import Link from "next/link";
import { Check, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { siteConfig } from "@/config/site";

function StoreButton({ href, label, store }) {
  return (
    <Button asChild variant="outline-light" size="lg" className="h-14 w-full sm:w-auto justify-start gap-3 rounded-2xl px-5">
      <a href={href} aria-label={`${label} ${store}`}>
        <Download className="size-5" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-medium text-white/60">{label}</span>
          <span className="block text-base font-bold">{store}</span>
        </span>
      </a>
    </Button>
  );
}

const points = [
  "Your purchased courses appear automatically",
  "Same email, same account — no codes to redeem",
  "Learn on any phone or tablet, wherever you are",
];

/** Explains the web → app handoff and links to store listings. */
export function AppShowcase() {
  return (
    <section className="section-y">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-ink via-brand-950 to-brand-800 px-5 py-10 text-white sm:px-12 lg:px-16 lg:py-16">
            <div aria-hidden className="bg-grid-dark pointer-events-none absolute inset-0 opacity-70" />
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-brand-500/40 blur-3xl" />
            <Logo mark tone="white" asLink={false} height={420} className="pointer-events-none absolute -right-16 -bottom-24 opacity-[0.05]" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <SectionHeading
                  align="left"
                  tone="dark"
                  eyebrow="The Hyskilled app"
                  title="Buy on the web. Learn in your pocket."
                  description={`This website is where you discover and purchase. Every course you buy unlocks in the ${siteConfig.app.name} — built for focused learning.`}
                  className="max-w-xl"
                />
                <ul className="mt-6 space-y-3">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-white/85">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                        <Check className="size-3.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <StoreButton href={siteConfig.app.androidUrl} label="Get it on" store="Google Play" />
                </div>
              </div>

              <div className="hidden justify-center lg:flex" aria-hidden>
                <div className="relative">
                  <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-brand-500/30 blur-3xl" />
                  <div className="grid size-56 place-items-center rounded-[3rem] border border-white/15 bg-white/10 backdrop-blur-xl animate-float">
                    <Smartphone className="size-24 text-white" strokeWidth={1.1} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
