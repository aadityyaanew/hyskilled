import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart2, CalendarClock, Check, Globe, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/shared/page-header";
import { JsonLd } from "@/components/shared/json-ld";
import { RatingSummary } from "@/components/shared/rating-stars";
import { SectionHeading } from "@/components/shared/section-heading";
import { CoursePurchaseCard } from "@/features/courses/course-purchase-card";
import { CourseSyllabus } from "@/features/courses/course-syllabus";
import { InstructorCard } from "@/features/courses/instructor-card";
import { MobilePurchaseBar } from "@/features/courses/mobile-purchase-bar";
import { CourseCard } from "@/features/courses/course-card";
import { FaqAccordion } from "@/features/marketing/faq-section";
import {
  getAllCourseSlugs,
  getCourseBySlug,
  getRelatedCourses,
} from "@/services/courses.service";
import { getFaqs, getTestimonials } from "@/services/content.service";
import { buildMetadata, courseJsonLd } from "@/lib/seo";
import { formatCompact, formatDate, formatHours } from "@/lib/format";
import { ROUTES } from "@/config/routes";

export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return buildMetadata({
    title: course.title,
    description: course.shortDescription,
    path: ROUTES.course(course.slug),
    keywords: [...course.tags, course.category?.name, "online course"].filter(Boolean),
  });
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="mb-5 text-2xl font-bold text-ink sm:text-[1.7rem]">{title}</h2>
      {children}
    </section>
  );
}

export default async function CourseDetailPage({ params }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [related, faqs, allTestimonials] = await Promise.all([
    getRelatedCourses(course, 3),
    getFaqs({ limit: 5 }),
    getTestimonials(),
  ]);
  const reviews = allTestimonials.filter((t) => t.courseSlug === course.slug);

  const crumbs = [
    { label: "Courses", href: ROUTES.courses },
    { label: course.category.short, href: ROUTES.category(course.categorySlug) },
    { label: course.title, href: ROUTES.course(course.slug) },
  ];

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={courseJsonLd(course, course.instructor)} />

      {/* Full-width dark hero section */}
      <div className="relative w-full bg-ink pt-8 pb-16 lg:pt-14 lg:pb-32 text-white overflow-hidden">
        <div aria-hidden className="bg-grid-dark absolute inset-0 opacity-60 pointer-events-none" />
        <div aria-hidden className="absolute -top-20 right-1/4 size-80 rounded-full bg-brand-600/30 blur-3xl pointer-events-none" />
        
        <div className="container-page relative z-10 grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <header className="lg:col-start-1">
            <Breadcrumbs items={crumbs} tone="dark" />
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge variant="glass">{course.category.short}</Badge>
              <Badge variant="glass">
                <BarChart2 className="mr-1 size-3.5" /> {course.level}
              </Badge>
              {course.badge && (
                <Badge className="border-transparent bg-amber-400 text-amber-950">{course.badge}</Badge>
              )}
            </div>
            <h1 className="mt-5 text-3xl leading-[1.1] font-extrabold sm:text-4xl lg:text-[2.8rem]">
              {course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/75">{course.subtitle}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
              <RatingSummary rating={course.rating} count={course.reviewCount} className="[&_span:first-child]:text-amber-300 [&_span:last-child]:text-white/60" />
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" /> {formatCompact(course.learners)} learners
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="size-4" /> English
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" /> Updated {formatDate(course.updatedAt, { month: "long", year: "numeric" })}
              </span>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Taught by <span className="font-semibold text-white">{course.instructor.name}</span>,{" "}
              {course.instructor.title}
            </p>
          </header>
        </div>
      </div>

      {/* Main Content & Sidebar Container */}
      <div className="container-page relative z-20 grid gap-x-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
        
        {/* Main Body */}
        <div className="lg:col-start-1 min-w-0 space-y-14 py-12 lg:py-10">
          <Section id="outcomes" title="What you'll learn">
            <ul className="grid gap-x-8 gap-y-3.5 rounded-3xl border bg-brand-50/40 p-6 sm:grid-cols-2 sm:p-8">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-3 text-[15px] text-ink-soft">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="about" title="About this course">
            <p className="text-[16px] leading-[1.75] text-muted-foreground">{course.description}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {course.tags.map((t) => (
                <li key={t} className="rounded-full border bg-white px-3.5 py-1.5 text-sm font-medium text-ink-soft">
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="syllabus" title="Syllabus overview">
            <p className="-mt-2 mb-5 text-sm text-muted-foreground">
              {course.moduleCount} modules · {formatHours(course.durationHours)} total. Full lessons are
              delivered inside the Hyskilled app.
            </p>
            <CourseSyllabus modules={course.modules} />
          </Section>

          <div className="grid gap-10 sm:grid-cols-2">
            <Section id="requirements" title="Requirements">
              <ul className="space-y-2.5">
                {course.requirements.map((r) => (
                  <li key={r} className="flex gap-3 text-[15px] text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
            <Section id="audience" title="Who this is for">
              <ul className="space-y-2.5">
                {course.audience.map((r) => (
                  <li key={r} className="flex gap-3 text-[15px] text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <Section id="instructor" title="Your instructor">
            <InstructorCard instructor={course.instructor} />
          </Section>

          <Section id="reviews" title="Learner reviews">
            <div className="flex flex-col gap-6 rounded-3xl border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
              <div className="text-center sm:pr-8 sm:text-left">
                <p className="font-heading text-6xl font-extrabold text-ink">{course.rating.toFixed(1)}</p>
                <RatingSummary rating={course.rating} size={18} className="justify-center [&>span:first-child]:hidden [&>span:last-child]:hidden" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.reviewCount.toLocaleString("en-IN")} ratings
                </p>
              </div>
              {reviews.length > 0 ? (
                <div className="grid flex-1 gap-4">
                  {reviews.map((r) => (
                    <figure key={r.id} className="rounded-2xl bg-muted/50 p-5">
                      <blockquote className="text-[15px] text-ink-soft">“{r.quote}”</blockquote>
                      <figcaption className="mt-3 text-sm font-semibold text-ink">
                        {r.name} <span className="font-normal text-muted-foreground">· {r.role}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="flex-1 text-muted-foreground">
                  Learners consistently rate this course {course.rating.toFixed(1)}/5 for clarity and
                  practical projects.
                </p>
              )}
            </div>
          </Section>

          <Section id="faq" title="Frequently asked questions">
            <FaqAccordion faqs={faqs} />
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-start-2 lg:row-start-1 relative">
          <div className="lg:sticky lg:top-24 mt-8 lg:-mt-24 lg:mb-12">
            <CoursePurchaseCard course={course} />
          </div>
        </aside>
      </div>

      {/* related */}
      <section className="border-t bg-muted/40 py-16 mt-8">
        <div className="container-page">
          <SectionHeading align="left" eyebrow="Keep exploring" title="You might also like" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </div>
      </section>

      <MobilePurchaseBar course={course} />
    </div>
  );
}
