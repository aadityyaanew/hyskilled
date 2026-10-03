import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { BundleCard } from "@/features/marketing/bundle-card";
import { ROUTES } from "@/config/routes";

/** Pricing / bundles block – reused on the homepage and /pricing. */
export function PricingSection({ bundles, showCta = true, heading }) {
  return (
    <section className="section-y relative overflow-hidden bg-muted/40">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            eyebrow={heading?.eyebrow ?? "Career tracks"}
            title={heading?.title ?? "Bundle up and save up to 45%"}
            description={
              heading?.description ??
              "Follow a curated path instead of picking course by course. One payment, every course unlocked in the app."
            }
          />
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-6xl items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
          {bundles.map((b, i) => (
            <Reveal key={b.slug} delay={i * 100}>
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
