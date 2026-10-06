import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Clean slugify string for URLs and IDs */
export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}


