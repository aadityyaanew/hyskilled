import { siteConfig } from "@/config/site";

const { locale, code } = siteConfig.currency;

const priceFormatter = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: code,
  maximumFractionDigits: 0,
});

const priceFormatterPrecise = new Intl.NumberFormat(locale, {
  style: "currency",
  currency: code,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat(locale, {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 4999 -> "₹4,999" (pass precise for paise: "₹4,238.14") */
export function formatPrice(amount, { precise = false } = {}) {
  const value = Number(amount) || 0;
  return (precise || !Number.isInteger(value)
    ? priceFormatterPrecise
    : priceFormatter
  ).format(value);
}

/** 52340 -> "52K" */
export function formatCompact(n) {
  return compactFormatter.format(n);
}

export function formatNumber(n) {
  return new Intl.NumberFormat(locale).format(n);
}

/** 42 -> "42 hrs" */
export function formatHours(hours) {
  return `${hours} hr${hours === 1 ? "" : "s"}`;
}

/** Percentage off, rounded: (9999, 4999) -> 50 */
export function discountPercent(original, current) {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

export function formatDate(date, options = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
