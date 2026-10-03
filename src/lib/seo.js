import { siteConfig } from "@/config/site";

/**
 * Build consistent per-page metadata (title template, canonical, OG, Twitter).
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image,
  noIndex = false,
  keywords,
} = {}) {
  const url = new URL(path, siteConfig.url).toString();
  const ogImages = image ? [{ url: image }] : undefined; // falls back to app/opengraph-image

  return {
    title,
    description,
    keywords: keywords ?? siteConfig.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      ...(ogImages && { images: ogImages }),
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${siteConfig.name}` : siteConfig.name,
      description,
      ...(ogImages && { images: ogImages }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

const abs = (path) => new URL(path, siteConfig.url).toString();

/* ───────── JSON-LD builders ───────── */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: abs(siteConfig.logo.full),
    sameAs: Object.values(siteConfig.socials),
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      contactType: "customer support",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/courses?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function courseJsonLd(course, instructor) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.shortDescription,
    url: abs(`/courses/${course.slug}`),
    provider: { "@type": "Organization", name: siteConfig.name, sameAs: siteConfig.url },
    ...(instructor && { instructor: { "@type": "Person", name: instructor.name } }),
    educationalLevel: course.level,
    inLanguage: "en",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: course.rating,
      reviewCount: course.reviewCount,
    },
    offers: {
      "@type": "Offer",
      price: course.price,
      priceCurrency: siteConfig.currency.code,
      availability: "https://schema.org/InStock",
      url: abs(`/courses/${course.slug}`),
    },
  };
}

export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: abs(item.href),
    })),
  };
}
