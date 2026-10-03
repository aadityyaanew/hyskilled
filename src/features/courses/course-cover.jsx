import { categories } from "@/data/categories";
import { CategoryIcon } from "@/features/categories/category-icon";
import { cn } from "@/lib/utils";

/**
 * Generated course cover art – a gradient + pattern + category glyph that is
 * unique per category/course, so the catalogue looks polished without needing
 * a library of uploaded thumbnails. When real thumbnails exist, render
 * <Image src={course.thumbnail}> here and keep this as the fallback.
 */
export function CourseCover({ course, category, className, size = "md", label }) {
  const cat = category ?? categories.find((c) => c.slug === course?.categorySlug) ?? categories[0];
  // Slight per-course hue variation inside the category family.
  const seed = (course?.slug ?? cat.slug).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = cat.hue + ((seed % 5) - 2) * 3;
  const tags = size === "xs" ? [] : (course?.tags ?? cat.keywords).slice(0, size === "lg" ? 4 : 2);
  const glyph =
    size === "xs"
      ? "size-9 right-1/2 bottom-1/2 translate-x-1/2 translate-y-1/2"
      : "right-5 bottom-4 size-24 sm:size-28";

  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 85% 0%, oklch(0.66 0.2 ${hue + 14}) 0%, transparent 55%),
                     linear-gradient(135deg, oklch(0.36 0.14 ${hue}) 0%, oklch(0.22 0.07 ${hue}) 100%)`,
      }}
      role="img"
      aria-label={label ?? `${cat.name} course cover`}
    >
      {/* grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(1 0 0 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 70% 30%, #000 20%, transparent 75%)",
        }}
      />
      {/* orbit rings */}
      <div
        aria-hidden
        className="absolute -right-10 -bottom-12 size-56 rounded-full border border-white/15"
      />
      <div
        aria-hidden
        className="absolute -right-2 -bottom-4 size-36 rounded-full border border-white/20"
      />
      {/* glyph */}
      <CategoryIcon
        name={cat.icon}
        aria-hidden
        strokeWidth={1.25}
        className={cn(
          "absolute text-white/90 drop-shadow-[0_8px_24px_oklch(0.2_0.1_20/0.5)] transition-transform duration-500 group-hover/cover:scale-110 group-hover/cover:-rotate-6",
          glyph
        )}
      />
      {/* tags */}
      <div className="absolute top-4 left-4 flex max-w-[70%] flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md"
          >
            {t}
          </span>
        ))}
      </div>
      {/* sheen */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover/cover:opacity-100"
      />
    </div>
  );
}
