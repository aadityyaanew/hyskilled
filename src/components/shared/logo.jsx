import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

/**
 * Brand logo. `tone="white"` swaps in the all-white variant for dark surfaces.
 * `mark` renders just the HY symbol.
 */
export function Logo({
  tone = "default",
  mark = false,
  className,
  height = 36,
  priority = false,
  asLink = true,
}) {
  const src = mark
    ? siteConfig.logo.mark
    : tone === "white"
      ? siteConfig.logo.white
      : siteConfig.logo.full;
  const ratio = mark ? 440 / 520 : siteConfig.logo.ratio;

  const img = (
    <Image
      src={src}
      alt={`${siteConfig.name} logo`}
      width={Math.round(height * ratio * 2)}
      height={height * 2}
      priority={priority}
      style={{ height, width: "auto" }}
      className={cn("select-none object-contain", className)}
    />
  );

  if (!asLink) return img;
  return (
    <Link
      href={ROUTES.home}
      aria-label={`${siteConfig.name} home`}
      className="focus-ring inline-flex rounded-md"
    >
      {img}
    </Link>
  );
}
