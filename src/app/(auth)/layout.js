import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { RatingStars } from "@/components/shared/rating-stars";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";
import { testimonials } from "@/data/testimonials";

const benefits = [
  { icon: Smartphone, text: `Courses unlock instantly in the ${siteConfig.app.name}` },
  { icon: BadgeCheck, text: "Pay once, lifetime access — no subscriptions" },
  { icon: ShieldCheck, text: siteConfig.guarantee.label },
];

/** Split-screen shell shared by login / register / forgot-password. */
export default function AuthLayout({ children }) {
  const quote = testimonials[0];
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[1.05fr_1fr]">
      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div aria-hidden className="bg-grid-dark pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 size-[34rem] rounded-full bg-primary/40 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-40 size-[30rem] rounded-full bg-brand-600/30 blur-[120px]" />

        <div className="relative">
          <Logo tone="white" height={40} priority />
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            <Sparkles className="size-3.5 text-brand-300" /> Tech skills that get you hired
          </span>
          <h2 className="mt-6 font-heading text-4xl leading-[1.1] font-bold xl:text-5xl">
            Buy on the web.
            <br />
            <span className="text-gradient">Learn anywhere.</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-white/80">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-300">
                  <b.icon className="size-[18px]" />
                </span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>

        {quote && (
          <figure className="glass relative max-w-lg rounded-3xl border-white/10 bg-white/5 p-6">
            <RatingStars value={quote.rating} />
            <blockquote className="mt-3 text-[15px] leading-relaxed text-white/85">“{quote.quote}”</blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold text-white">{quote.name}</span>
              <span className="text-white/55"> · {quote.role}</span>
            </figcaption>
          </figure>
        )}
      </aside>

      {/* form panel */}
      <div className="flex flex-col bg-background">
        <header className="flex items-center justify-between px-5 py-5 sm:px-10">
          <div className="lg:hidden">
            <Logo height={32} priority />
          </div>
          <Link
            href={ROUTES.home}
            className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </header>
        <main id="main-content" className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
