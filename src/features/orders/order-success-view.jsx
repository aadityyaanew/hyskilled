"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Download, ExternalLink, LogIn, Mail, Printer, SearchX, Smartphone, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummaryCard } from "@/features/orders/order-summary-card";
import { useOrder } from "@/features/orders/use-order";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

const nextSteps = (email) => [
  { icon: Download, title: "Get the app", text: `Download the ${siteConfig.app.name} on iOS or Android.` },
  { icon: LogIn, title: "Log in", text: `Sign in with ${email} — the email you used at checkout.` },
  { icon: Smartphone, title: "Start learning", text: "Your purchased courses are already in your library." },
];

export function OrderSuccessView() {
  const id = useSearchParams().get("order");
  const { order, hydrated } = useOrder(id);

  if (!hydrated) return <div className="skeleton-shimmer mx-auto h-96 max-w-3xl rounded-3xl" />;

  if (!order || order.status !== "paid") {
    return (
      <EmptyState
        icon={SearchX}
        title="We couldn't find a confirmed order"
        description="This order may belong to another browser or isn't paid yet. If you've been charged, contact support with your order ID and we'll sort it out right away."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="brand">
              <Link href={ROUTES.account}>View my orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={ROUTES.contact}>Contact support</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border bg-white px-6 py-12 text-center shadow-soft sm:px-12">
        <div aria-hidden className="absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="relative">
          <div className="mx-auto grid size-24 animate-pulse-ring place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
            <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 13l4 4L19 7" className="animate-fade-up" />
            </svg>
          </div>
          <h1 className="mt-7 text-3xl font-extrabold text-ink sm:text-4xl">Payment successful!</h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-muted-foreground">
            Thank you, {order.customer.name.split(" ")[0]}. Your course{order.items.length > 1 ? "s are" : " is"} ready in the {siteConfig.app.name}.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-ink-soft">
            <Mail className="size-4 text-primary" />
            Receipt sent to <span className="font-semibold text-ink">{order.customer.email}</span>
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="xl" variant="brand">
              <a href={`${siteConfig.app.deepLinkBase}library`}>
                Open the app <ExternalLink />
              </a>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href={ROUTES.courses}>
                Keep exploring <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Post-Payment Enrollment Documentation Action */}
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-brand-500/30 bg-gradient-to-br from-brand-50/50 via-white to-brand-50/20 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
              <ClipboardCheck className="size-3.5" />
              Action Required · Post-Payment Step
            </div>
            <h2 className="font-heading text-xl font-bold text-ink sm:text-2xl">
              Complete Your Enrollment Documentation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              Thank you for choosing Hyskilled. Please provide your personal details, address, government ID, and academic documents to complete your enrollment verification.
            </p>
            <p className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-1.5 inline-block">
              Important: Batch allocation will take place only after 100% of the applicable tuition fee has been paid and successfully verified.
            </p>
          </div>
          <Button asChild size="xl" variant="brand" className="shrink-0 shadow-lg shadow-brand-500/20">
            <Link href={ROUTES.enrollment(order.id)}>
              Complete Documentation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* how to start */}
      <section aria-labelledby="next-steps" className="rounded-3xl border bg-white p-6 sm:p-8">
        <h2 id="next-steps" className="font-heading text-xl font-bold text-ink">
          Start learning in 3 steps
        </h2>
        <ol className="mt-6 grid gap-5 sm:grid-cols-3">
          {nextSteps(order.customer.email).map((s, i) => (
            <li key={s.title} className="relative rounded-2xl bg-muted/50 p-5">
              <span className="mb-3 grid size-10 place-items-center rounded-xl bg-primary text-white">
                <s.icon className="size-5" />
              </span>
              <p className="font-bold text-ink">
                {i + 1}. {s.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">

          <Button asChild variant="dark">
            <a href={siteConfig.app.androidUrl}>
              <Download /> Google Play
            </a>
          </Button>
        </div>
      </section>

      {/* receipt */}
      <section aria-labelledby="receipt" className="rounded-3xl border bg-white p-6 sm:p-8 print:border-0">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="receipt" className="font-heading text-xl font-bold text-ink">
            Order summary
          </h2>
          <Button variant="ghost" size="sm" onClick={() => window.print()} className="print:hidden">
            <Printer /> Print receipt
          </Button>
        </div>
        <OrderSummaryCard order={order} />
      </section>

      <p className="text-center text-sm text-muted-foreground">
        Need help?{" "}
        <Link href={ROUTES.contact} className="font-semibold text-primary hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}
