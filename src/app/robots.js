import { siteConfig } from "@/config/site";

export default function robots() {
  const baseUrl = siteConfig.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/checkout/",
        "/cart/",
        "/order/",
        "/account/",
        "/login/",
        "/register/",
        "/forgot-password/",
        "/admin/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
