import { BookOpen, CheckCircle, GraduationCap, IndianRupee, Star, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SeatBookingForm } from "@/features/seat-booking/seat-booking-form";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Register Your Seat",
  description:
    "Secure your seat at Hyskilled with a ₹2500 booking amount. Fill in your details, choose your course, and pay securely to reserve your place.",
  path: ROUTES.registerSeat,
});

const benefits = [
  {
    icon: GraduationCap,
    title: "Expert-Led Training",
    description: "Learn from industry practitioners who build real products at top tech companies.",
  },
  {
    icon: Users,
    title: "Small Batch Sizes",
    description: "Focused cohorts ensure personalised attention and faster learning outcomes.",
  },
  {
    icon: BookOpen,
    title: "Industry Curriculum",
    description: "Curriculum designed around what tech companies actually hire for — no fluff.",
  },
  {
    icon: Star,
    title: "Career Support",
    description: "Resume reviews, mock interviews, and placement assistance to land your dream job.",
  },
];

const faqs = [
  {
    q: "Is the ₹2500 amount refundable?",
    a: "The booking amount is non-refundable, but it will be fully adjusted against your tuition fees when you join the program.",
  },
  {
    q: "When will I receive confirmation?",
    a: "Our team will reach out within 24 hours after payment to confirm your seat and share onboarding details.",
  },
  {
    q: "Can I change the course later?",
    a: "Yes, you can switch your course choice before your batch starts. Contact us and we will accommodate your request.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI, debit/credit cards, net banking, and popular wallets — all secured by Cashfree.",
  },
];

export default function RegisterSeatPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reserve Your Spot"
        title="Register Your Seat Today"
        description="Secure your place in the next cohort with just ₹2500. The booking amount is fully adjusted against your tuition fees."
        breadcrumbs={[{ label: "Register Your Seat", href: ROUTES.registerSeat }]}
      />

      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-col-reverse gap-8 sm:gap-12 lg:grid lg:grid-cols-[1fr_1.35fr] lg:gap-16 xl:gap-20">
            {/* ─── Left: info panel ─── */}
            <div className="space-y-10">
              {/* Booking amount card */}
              <div className="relative overflow-hidden rounded-3xl bg-ink p-6 sm:p-8 text-white shadow-lift">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-brand-600/40 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -left-12 size-36 rounded-full bg-brand-500/30 blur-3xl"
                />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-300">
                    Booking Amount
                  </p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">₹2500</span>
                  </div>
                  <p className="mt-2 text-sm text-white/70">
                    Fully adjusted against tuition fees · Non-refundable
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {[
                      "Confirms your seat in the upcoming batch",
                      "Amount deducted from your total course fee",
                      "Priority support from our academic counselors",
                      "Exclusive pre-joining study materials",
                    ].map((point) => (
                      <li key={point} className="flex items-center gap-2.5 text-sm text-white/80">
                        <CheckCircle className="size-4 shrink-0 text-brand-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Benefits grid */}
              <div>
                <h2 className="font-heading text-xl font-bold text-ink">
                  Why choose Hyskilled?
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {benefits.map((b) => (
                    <div
                      key={b.title}
                      className="flex gap-3.5 rounded-2xl border bg-card p-4 transition-colors hover:border-brand-200"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary">
                        <b.icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-ink">{b.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="font-heading text-xl font-bold text-ink">
                  Frequently asked questions
                </h2>
                <ul className="mt-5 space-y-4">
                  {faqs.map((faq) => (
                    <li
                      key={faq.q}
                      className="rounded-2xl border bg-card p-5 transition-colors hover:border-brand-200"
                    >
                      <p className="text-sm font-bold text-ink">{faq.q}</p>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ─── Right: form panel ─── */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-ink sm:text-3xl">
                  Fill in your details
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete the form below and pay ₹2500 securely to lock in your seat.
                </p>
              </div>
              <SeatBookingForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
