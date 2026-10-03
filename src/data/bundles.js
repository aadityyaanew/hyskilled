/**
 * Career-track bundles. Prices are computed from member courses at read time
 * (see bundles.service.js) so the catalogue stays the single source of truth.
 * `price` here is the discounted bundle price.
 */
export const bundles = [
  {
    id: "ai-career-track",
    slug: "ai-career-track",
    name: "AI Career Track",
    tagline: "From AI-curious to AI engineer",
    description:
      "Everything you need to build a career in applied AI: prompting, machine learning and production LLM apps.",
    courseSlugs: [
      "prompt-engineering-ai-productivity",
      "machine-learning-a-z-scikit-learn",
      "generative-ai-engineering-llm-apps",
    ],
    price: 9999,
    highlight: false,
  },
  {
    id: "data-professional-track",
    slug: "data-professional-track",
    name: "Data Professional Track",
    tagline: "Our most popular career path",
    description:
      "Go from spreadsheets to machine learning with a complete, job-focused data toolkit.",
    courseSlugs: [
      "data-science-python-job-ready",
      "data-analytics-sql-power-bi",
      "machine-learning-a-z-scikit-learn",
    ],
    price: 12999,
    highlight: true,
  },
  {
    id: "full-stack-builder-track",
    slug: "full-stack-builder-track",
    name: "Full-Stack Builder Track",
    tagline: "Design it. Build it. Ship it.",
    description:
      "Learn web foundations, full-stack engineering and UI/UX design to build complete products on your own.",
    courseSlugs: [
      "web-development-foundations-html-css-js",
      "full-stack-web-development-react-nextjs",
      "ui-ux-design-masterclass-figma",
    ],
    price: 9499,
    highlight: false,
  },
];
