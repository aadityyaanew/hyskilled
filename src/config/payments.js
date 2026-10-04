/**
 * Payment provider registry.
 * `sandbox` is the built-in simulator used until a real gateway is wired in.
 * To integrate a real gateway, implement the adapter contract described in
 * `src/services/payments/README` (see payments.service.js) and flip
 * NEXT_PUBLIC_PAYMENT_PROVIDER.
 */
export const paymentMethods = [
  {
    id: "upi",
    label: "UPI",
    description: "Google Pay, PhonePe, Paytm & more",
    icon: "Smartphone",
    popular: true,
  },
  {
    id: "card",
    label: "Credit / Debit card",
    description: "Visa, Mastercard, RuPay, Amex",
    icon: "CreditCard",
  },
  {
    id: "netbanking",
    label: "Net banking",
    description: "All major Indian banks",
    icon: "Landmark",
  },
  {
    id: "wallet",
    label: "Wallets",
    description: "Paytm, Amazon Pay, Mobikwik",
    icon: "Wallet",
  },
];

export const paymentProviders = {
  sandbox: { id: "sandbox", label: "Sandbox (demo)", live: false },
  cashfree: { id: "cashfree", label: "Cashfree", live: true },
  razorpay: { id: "razorpay", label: "Razorpay", live: true },
  stripe: { id: "stripe", label: "Stripe", live: true },
};
