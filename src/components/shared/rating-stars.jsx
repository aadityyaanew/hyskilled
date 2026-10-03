import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible star rating with partial fill. */
export function RatingStars({ value = 0, size = 14, className }) {
  return (
    <span
      role="img"
      aria-label={`Rated ${value} out of 5`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              width={size}
              height={size}
              className="absolute inset-0 text-amber-200"
              fill="currentColor"
              strokeWidth={0}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                width={size}
                height={size}
                className="text-amber-400"
                fill="currentColor"
                strokeWidth={0}
              />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingSummary({ rating, count, className, size = 14 }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <span className="font-bold text-amber-600">{rating.toFixed(1)}</span>
      <RatingStars value={rating} size={size} />
      {count !== undefined && (
        <span className="text-muted-foreground">({new Intl.NumberFormat("en-IN").format(count)})</span>
      )}
    </span>
  );
}
