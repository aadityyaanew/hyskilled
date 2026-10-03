import { testimonials } from "@/data/testimonials";
import { faqs, faqGroups } from "@/data/faqs";
import { courses } from "@/data/courses";

export async function getTestimonials(limit) {
  const list = testimonials.map((t) => ({
    ...t,
    courseTitle: courses.find((c) => c.slug === t.courseSlug)?.title ?? null,
  }));
  return limit ? list.slice(0, limit) : list;
}

export async function getFaqs({ group, limit } = {}) {
  let list = group ? faqs.filter((f) => f.group === group) : faqs;
  if (limit) list = list.slice(0, limit);
  return list;
}

export async function getFaqGroups() {
  return faqGroups;
}
