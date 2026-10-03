import { cn } from "@/lib/utils";

/** Consistent section title block (eyebrow + h2 + description). */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  as: Heading = "h2",
  className,
  children,
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] uppercase",
            dark ? "text-brand-300" : "text-primary"
          )}
        >
          <span className={cn("h-px w-6", dark ? "bg-brand-300/60" : "bg-primary/50")} />
          {eyebrow}
          {align === "center" && (
            <span className={cn("h-px w-6", dark ? "bg-brand-300/60" : "bg-primary/50")} />
          )}
        </p>
      )}
      <Heading
        className={cn(
          "text-3xl leading-[1.1] font-bold sm:text-4xl lg:text-[2.75rem]",
          dark ? "text-white" : "text-ink"
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            dark ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
