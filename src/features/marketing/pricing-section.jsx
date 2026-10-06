"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { BundleCard } from "@/features/marketing/bundle-card";
import { ROUTES } from "@/config/routes";

/** Pricing / bundles block – reused on the homepage and /pricing. */
export function PricingSection({ bundles, showCta = true, heading }) {
  const scrollRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!scrollRef.current || window.innerWidth >= 1024) return;
    
    // Find the highlighted bundle or default to the middle one
    const targetIdx = Math.max(0, bundles.findIndex(b => b.highlight) >= 0 
      ? bundles.findIndex(b => b.highlight) 
      : Math.floor(bundles.length / 2));
      
    setActiveIdx(targetIdx);
      
    const timer = setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      const targetCard = container.children[targetIdx];
      if (targetCard) {
        const scrollPos = targetCard.offsetLeft - (container.clientWidth / 2) + (targetCard.clientWidth / 2);
        container.scrollTo({ left: scrollPos, behavior: "smooth" });
      }
    }, 500); // small delay to ensure rendering and layout are complete

    return () => clearTimeout(timer);
  }, [bundles]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || window.innerWidth >= 1024) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(container.children).indexOf(entry.target);
            if (idx !== -1) {
              setActiveIdx(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6, // Fire when card is 60% visible
      }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [bundles]);

  const scrollToIdx = (idx) => {
    const container = scrollRef.current;
    if (!container) return;
    const targetCard = container.children[idx];
    if (targetCard) {
      const scrollPos = targetCard.offsetLeft - (container.clientWidth / 2) + (targetCard.clientWidth / 2);
      container.scrollTo({ left: scrollPos, behavior: "smooth" });
      setActiveIdx(idx);
    }
  };

  const getShortName = (name) => {
    return name
      .replace(" Career Track", "")
      .replace(" Professional Track", "")
      .replace(" Builder Track", "")
      .replace(" Track", "");
  };

  return (
    <section className="section-y relative overflow-hidden bg-muted/40">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            eyebrow={heading?.eyebrow ?? "Career tracks"}
            title={heading?.title ?? "Plan your program and save up to 45%"}
            description={
              heading?.description ??
              "Follow a curated path instead of picking course by course. One payment, every course unlocked in the app."
            }
          />
        </Reveal>

        {/* Mobile Tab Indicator */}
        <div className="mt-10 mb-2 flex justify-center lg:hidden">
          <div className="flex items-center rounded-full border bg-background p-1 shadow-sm">
            {bundles.map((b, i) => {
              const isActive = activeIdx === i;
              return (
                <button
                  key={b.id}
                  onClick={() => scrollToIdx(i)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {getShortName(b.name)}
                </button>
              );
            })}
          </div>
        </div>

        <div ref={scrollRef} className="-mx-5 mt-4 flex snap-x snap-mandatory items-stretch gap-6 overflow-x-auto px-5 pt-4 pb-8 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-auto lg:mt-12 lg:grid lg:max-w-6xl lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pt-0 lg:pb-0 lg:gap-8 [&::-webkit-scrollbar]:hidden">
          {bundles.map((b, i) => (
            <Reveal 
              key={b.slug} 
              delay={i * 100}
              className="w-[85vw] shrink-0 snap-center sm:w-[380px] lg:w-auto"
            >
              <BundleCard bundle={b} />
            </Reveal>
          ))}
        </div>

        {showCta && (
          <p className="mt-12 text-center text-muted-foreground">
            Just need one course?{" "}
            <Link href={ROUTES.courses} className="focus-ring inline-flex items-center gap-1 rounded font-semibold text-primary hover:underline">
              Browse individual courses <ArrowRight className="size-4" />
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
