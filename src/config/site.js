/**
 * Central site configuration.
 * Every piece of brand / business copy that may later come from a CMS or the
 * admin panel lives here so pages never hard-code it.
 */
export const siteConfig = {
  name: "Hyskilled",
  legalName: "Hyskilled Learning Pvt. Ltd.",
  tagline: "Master in-demand tech skills",
  description:
    "Hyskilled offers premium, career-focused technology courses in AI, Data Science, Machine Learning, UI/UX, Web Development and more. Buy once on the web, learn anywhere in the Hyskilled app.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_IN",
  keywords: [
    "online tech courses",
    "AI course",
    "data science course",
    "machine learning course",
    "UI UX design course",
    "web development course",
    "Hyskilled",
  ],
  logo: {
    full: "/brand/logo.png",
    white: "/brand/logo-white.png",
    mark: "/brand/mark.png",
    ratio: 1300 / 520,
  },
  contact: {
    email: "support@hyskilled.com",
    phone: "+91 8076480188",
    address: "Near Gardenia Gateway, Plot C and D, Metro Station Road Sector 50, Noida, Uttar Pradesh - 201316",
    hours: "Mon – Sat, 10:00 AM – 7:00 PM IST",
  },
  socials: {
    twitter: "https://twitter.com/hyskilled",
    linkedin: "https://linkedin.com/company/hyskilled",
    instagram: "https://instagram.com/hyskilled",
    youtube: "https://youtube.com/@hyskilled",
  },
  /** The separate learning app where purchased courses are consumed. */
  app: {
    name: "Hyskilled App",
    iosUrl: "#",
    androidUrl: "#",
    deepLinkBase: "hyskilled://",
  },
  currency: { code: "INR", symbol: "₹", locale: "en-IN" },
  /** Prices shown across the site are GST-inclusive. */
  tax: { label: "GST", rate: 0.18, inclusive: true },
  /** Replace with real, verified numbers before launch. */
  stats: [
    { label: "Learners enrolled", value: 52000, suffix: "+" },
    { label: "Average course rating", value: 4.9, suffix: "/5", decimals: 1 },
    { label: "Expert instructors", value: 40, suffix: "+" },
    { label: "Learner satisfaction", value: 96, suffix: "%" },
  ],
  
};
