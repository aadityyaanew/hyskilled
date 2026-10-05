/** Catalogue filter/sort options shared by server services and client UI. */

export const PAGE_SIZE = 9;

export const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Highest rated" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
];

export const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const PRICE_RANGES = [
  { value: "under-2500", label: "Under ₹2,500", test: (p) => p < 2500 },
  { value: "2500-5000", label: "₹2,500 – ₹5,000", test: (p) => p >= 2500 && p <= 5000 },
  { value: "above-5000", label: "Above ₹5,000", test: (p) => p > 5000 },
];
