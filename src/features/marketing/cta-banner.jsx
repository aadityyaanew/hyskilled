import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { ROUTES } from "@/config/routes";

export function CtaBanner({
  title = "Your next career move starts with one course.",
  description = "Join thousands of learners building job-ready tech skills with Hyskilled.",
}) {
  return (
    <section className="section-y pt-0">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-500 via-brand-700 to-brand-900 px-6 py-14 text-center text-white shadow-glow sm:px-12 sm:py-20">
            <div aria-hidden className="bg-grid-dark pointer-events-none absolute inset-0" />
            <div aria-hidden className="pointer-events-none absolute -top-20 left-1/4 size-72 rounded-full bg-white/15 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Rocket className="size-6" />
              </span>
              <h2 className="text-3xl font-extrabold sm:text-5xl">{title}</h2>
              <p className="mt-4 text-lg text-white/80">{description}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="xl" variant="light">
                  <Link href={ROUTES.courses}>
                    Explore courses <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline-light">
                  <Link href={ROUTES.pricing}>See bundles</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
