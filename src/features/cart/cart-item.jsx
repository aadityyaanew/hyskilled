"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCover } from "@/features/courses/course-cover";
import { PriceDisplay } from "@/components/shared/price-display";
import { Badge } from "@/components/ui/badge";
import { lineItemHref } from "@/lib/line-items";
import { cn } from "@/lib/utils";

export function CartItem({ item, onRemove, compact = false, removable = true, className }) {
  return (
    <li className={cn("flex gap-4", className)}>
      <CourseCover
        course={{ slug: item.slug, categorySlug: item.categorySlug }}
        size="xs"
        className={cn("shrink-0 rounded-xl", compact ? "size-16" : "size-20 sm:size-24")}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.type === "bundle" && (
              <Badge variant="soft" className="mb-1">
                Bundle
              </Badge>
            )}
            <Link
              href={lineItemHref(item)}
              className="focus-ring line-clamp-2 rounded font-semibold text-ink hover:text-primary"
            >
              {item.title}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
          </div>
          {removable && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.title} course`}
            >
              <Trash2 />
            </Button>
          )}
        </div>
        <PriceDisplay
          className="mt-2"
          price={item.price}
          originalPrice={item.originalPrice}
          size="sm"
          showDiscount={!compact}
        />
      </div>
    </li>
  );
}
