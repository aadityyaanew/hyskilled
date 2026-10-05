import { Users, Briefcase, GraduationCap, Zap, CheckCircle2 } from "lucide-react";
import { HireForm } from "@/features/marketing/hire-form";
import { Reveal } from "@/components/shared/reveal";
import { PageHeader } from "@/components/shared/page-header";
import { ROUTES } from "@/config/routes";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Hire From Us | Hyskilled",
  description: "Hire top tech talent directly from Hyskilled. Our graduates are industry-ready and trained in the latest technology stacks.",
};

export default function HireFromUsPage() {
  const benefits = [
    {
      title: "Pre-vetted Talent",
      desc: "Every candidate undergoes rigorous evaluations and builds complex projects before graduating.",
      icon: Users
    },
    {
      title: "Zero Hiring Cost",
      desc: "We don't charge any placement fees or commissions. Hire top talent absolutely free of cost.",
      icon: Briefcase
    },
    {
      title: "Immediate Joiners",
      desc: "Skip the notice period hassle. Our graduates are ready to join and start contributing immediately.",
      icon: Zap
    },
    {
      title: "Modern Tech Stack",
      desc: "Trained in React, Node.js, Python, Cloud computing, and Generative AI to meet today's industry needs.",
      icon: GraduationCap
    }
  ];

  const process = [
    { title: "Share Requirements", desc: "Fill out the form with your open roles, skills required, and compensation details." },
    { title: "Candidate Shortlisting", desc: "Our team shares profiles of pre-screened candidates matching your exact criteria." },
    { title: "Interview & Selection", desc: "Conduct interviews directly with candidates. No middlemen involved." },
    { title: "Extend Offer", desc: "Select the best fit and extend an offer. They join you immediately!" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="For Employers"
        title="Hire top tech talent without the hassle"
        description="Connect with our pool of highly trained, pre-vetted developers and engineers. Ready to join your team and start contributing from day one."
        breadcrumbs={[{ label: "Hire From Us", href: ROUTES.hireFromUs }]}
      />

      <section className="section-y bg-muted/30">
        <div className="container-page">
          <div className="mx-auto grid gap-12 lg:grid-cols-[1fr,450px] lg:gap-16 items-start">
            
            <div className="space-y-16">
              <Reveal>
                <div>
                  <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
                    Why hire from Hyskilled?
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    We bridge the gap between academia and industry by training students in exactly what modern product companies need. No generic tutorials, just production-grade engineering.
                  </p>
                  
                  <div className="mt-10 grid gap-6 sm:grid-cols-2">
                    {benefits.map((b, i) => (
                      <div key={i} className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                        <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-50 text-primary">
                          <b.icon className="size-6" />
                        </span>
                        <h3 className="text-lg font-bold text-ink">{b.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {b.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal>
                <div>
                  <h2 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
                    Our Hiring Process
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    A streamlined, transparent process designed to get you the right candidates quickly.
                  </p>
                  
                  <div className="mt-8 space-y-6">
                    {process.map((step, i) => (
                      <div key={i} className="flex items-start gap-4 rounded-3xl border bg-card p-6 shadow-soft">
                        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-primary">
                          {i + 1}
                        </span>
                        <div>
                          <h4 className="text-lg font-bold text-ink">{step.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Sticky Form */}
            <div className="lg:sticky lg:top-24 mt-8 lg:mt-0">
              <Reveal delay={120}>
                <HireForm />
              </Reveal>
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
}
