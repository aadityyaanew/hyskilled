import { ROUTES } from "./routes";

export const mainNav = [
  { label: "Courses", href: ROUTES.courses, mega: true },
  { label: "Program Plans", href: ROUTES.pricing },
  { label: "About", href: ROUTES.about },
  { label: "Contact us", href: ROUTES.contact },
];

export const footerNav = [
  {
    title: "Explore",
    links: [
      { label: "All courses", href: ROUTES.courses },
      { label: "Categories", href: ROUTES.categories },
      { label: "Program plans", href: ROUTES.pricing },
      { label: "My Learning", href: ROUTES.cart },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Hyskilled", href: ROUTES.about },
      { label: "Careers", href: "/careers" },
      { label: "Hire from us", href: ROUTES.hireFromUs },
      { label: "Blog", href: ROUTES.blog },
      { label: "Contact us", href: ROUTES.contact },
      { label: "FAQs", href: ROUTES.faq },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: ROUTES.terms },
      { label: "Privacy Policy", href: ROUTES.privacy },
      { label: "Refund Policy", href: ROUTES.refundPolicy },
    ],
  },
];

export const accountNav = [
  { label: "My orders", href: ROUTES.account },
  { label: "My Learning", href: ROUTES.cart },
];
