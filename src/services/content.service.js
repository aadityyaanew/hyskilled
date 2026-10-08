import { testimonials } from "@/data/testimonials";
import { faqs, faqGroups } from "@/data/faqs";
import { getCourseBySlug } from "@/services/courses.service";

export async function getTestimonials(limit) {
  const list = await Promise.all(
    testimonials.map(async (t) => {
      const course = t.courseSlug ? await getCourseBySlug(t.courseSlug) : null;
      return {
        ...t,
        courseTitle: course?.title ?? null,
      };
    })
  );
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
