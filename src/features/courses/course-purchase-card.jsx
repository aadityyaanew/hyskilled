import { BarChart2, Clock, Download, Infinity as InfinityIcon, Layers, ShieldCheck, Smartphone, Award } from "lucide-react";
import { CourseCover } from "@/features/courses/course-cover";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { PriceDisplay } from "@/components/shared/price-display";
import { courseToLineItem } from "@/lib/line-items";
import { formatHours } from "@/lib/format";
import { siteConfig } from "@/config/site";

/** Sticky purchase card on the course detail page. */
export function CoursePurchaseCard({ course }) {
  const item = courseToLineItem(course);
  const includes = [
    { icon: Smartphone, text: `Unlocks in the ${siteConfig.app.name}` },
    { icon: Clock, text: `${formatHours(course.durationHours)} of content` },
    { icon: Layers, text: `${course.moduleCount} modules` },
    { icon: BarChart2, text: `${course.level} level` },
    { icon: InfinityIcon, text: "Lifetime access & free updates" },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-lift">
      <CourseCover course={course} className="hidden aspect-[16/9] w-full lg:block" />
      <div className="p-6">
        <PriceDisplay price={course.price} originalPrice={course.originalPrice} size="lg" />
        <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · One-time payment</p>

        <div className="mt-5 space-y-2.5">
          <AddToCartButton item={item} buyNow size="xl" className="w-full">
            Start Learning
          </AddToCartButton>
          <AddToCartButton item={item} variant="outline" size="lg" className="w-full" />
        </div>

        

        <div className="mt-6 border-t pt-5">
          <h2 className="font-heading text-sm font-bold text-ink">This course includes</h2>
          <ul className="mt-3 space-y-2.5">
            {includes.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink-soft">
                <Icon className="size-4 shrink-0 text-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
