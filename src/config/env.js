
export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Base URL of the future backend API. Empty => use mock data layer. */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  /** Payment provider key to use at checkout (razorpay | stripe | sandbox). */
  paymentProvider: process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "sandbox",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  cashfreeAppId: process.env.NEXT_PUBLIC_CASHFREE_APP_ID ?? "",
  cashfreeEnv: process.env.CASHFREE_ENV ?? "sandbox",
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
};

export const isProd = process.env.NODE_ENV === "production";
