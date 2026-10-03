import { Smartphone, Target, Code2, Users, ShieldCheck, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal } from "@/components/shared/reveal";
import { RatingStars } from "@/components/shared/rating-stars";
import { CtaBanner } from "@/features/marketing/cta-banner";
import { getInstructors } from "@/services/courses.service";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "About Us",
  description:
    "Learn about Hyskilled's mission to bridge the tech talent gap with practical, industry-grade courses and seamless mobile learning.",
  path: ROUTES.about,
});

const values = [
  {
    icon: Target,
    title: "Curriculum Built for Employment",
    description:
      "Every module is designed backward from modern hiring rubrics. No fluff, no obsolete syntax—only modern frameworks, production workflows, and real architecture.",
  },
  {
    icon: Code2,
    title: "Engineering over Passive Watching",
    description:
      "Tutorial hell ends here. You build scalable backends, deploy LLM apps to cloud platforms, build responsive interfaces, and craft production design systems.",
  },
  {
    icon: Smartphone,
    title: "Seamless Native App Learning",
    description:
      "Our website delivers an effortless, transparent discovery and checkout experience. The moment you purchase, your courses instantly sync to the Hyskilled mobile app for distraction-free learning on the go.",
  },
  {
    icon: Zap,
    title: "Zero Subscriptions, Forever Access",
    description:
      "We believe you should own your education. Pay once for a course or bundle, and get lifetime access including all future curriculum revisions and material updates.",
  },
];

export default async function AboutPage() {
  const instructors = await getInstructors();

  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Upskilling tech minds for the future of work"
        description="We started Hyskilled with a simple observation: most online courses teach syntax, but tech companies hire engineers who can build and solve real problems."
        breadcrumbs={[{ label: "About Us", href: ROUTES.about }]}
      />

      {/* Mission & Philosophy */}
      <section className="section-y">
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Why We Exist
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-4xl">
                Bridging the gap between tutorials and production engineering
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Technology is moving faster than ever. AI, LLMs, cloud architecture, and modern product
                design demand skills that weren't taught in college and are rarely found in generic
                video catalogs.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Hyskilled is built around rigorous, practical engineering. You explore and purchase your
                courses directly through this secure web portal, and take your classroom anywhere with
                the dedicated Hyskilled mobile app.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative rounded-3xl border bg-gradient-to-br from-brand-50/80 via-white to-brand-100/40 p-8 sm:p-12 shadow-soft">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-white">
                      <Target className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-bold text-ink text-lg">Hyper-focused on Tech</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        We don't teach everything. We focus exclusively on high-impact disciplines:
                        AI, Data Science, Web & Mobile Engineering, and Product Design.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-100 text-primary">
                      <Smartphone className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-bold text-ink text-lg">Web Storefront + Mobile App</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Buy securely on the web with instant invoice delivery; stream and learn on the
                        Hyskilled iOS and Android mobile app anytime, anywhere.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-bold text-ink text-lg">Confidence & Trust</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Backed by our 7-day money-back guarantee, transparent pricing with all GST included,
                        and dedicated learner support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="border-y bg-ink py-12 text-white">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {siteConfig.stats.map((s) => (
              <div key={s.label} className="text-center sm:text-left">
                <p className="font-heading text-4xl font-extrabold text-white sm:text-5xl">
                  {s.value.toLocaleString()}
                  <span className="text-primary">{s.suffix}</span>
                </p>
                <p className="mt-2 text-sm text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-y bg-muted/30">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Our Principles"
              title="What makes Hyskilled different"
              description="We built Hyskilled to be the learning platform we wished we had when starting our tech careers."
            />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                  <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-brand-50 text-primary">
                    <v.icon className="size-6" />
                  </span>
                  <h3 className="text-lg font-bold text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors */}
      <section className="section-y">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Taught by Experts"
              title="Learn directly from industry practitioners"
              description="Our instructors build software, manage engineering teams, and design production systems at top tech companies."
            />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((inst, i) => (
              <Reveal key={inst.id} delay={i * 70}>
                <div className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-soft">
                  <div className="flex items-center gap-4">
                    <div className="grid size-14 place-items-center rounded-2xl bg-brand-100 text-lg font-bold text-primary">
                      {inst.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-ink text-lg">{inst.name}</h3>
                      <p className="text-xs font-semibold text-primary">{inst.title}</p>
                    </div>
                  </div>

                  <p className="mt-4 flex-1 text-sm text-muted-foreground leading-relaxed">
                    {inst.bio}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-600">
                      <span>★ {inst.rating}</span>
                      <span className="font-normal text-muted-foreground">instructor rating</span>
                    </div>
                    <span className="font-medium text-ink">
                      {inst.learners.toLocaleString()} learners
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
