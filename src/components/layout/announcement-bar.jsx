import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { getSetting } from "@/services/settings.service";

export async function AnnouncementBar() {
  const announcement = await getSetting("announcement", {
    text: "Launch offer: take 20% off your first course with code",
    code: "WELCOME20",
    enabled: true,
  });

  if (!announcement?.enabled) return null;

  return (
    <div className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-800/80 via-brand-600/60 to-brand-800/80"
      />
      <div className="container-page relative flex min-h-9 sm:min-h-10 items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 text-center text-xs sm:text-[13px] font-medium">
        <Zap className="size-3.5 sm:size-4 shrink-0 text-amber-300" />
        <p className="leading-tight">
          {announcement.text}{" "}
          {announcement.code && (
            <code className="rounded bg-white/15 px-1.5 py-0.5 font-bold tracking-wide text-[11px] sm:text-xs">
              {announcement.code}
            </code>
          )}
        </p>
        <Link
          href={ROUTES.courses}
          className="focus-ring inline-flex items-center gap-1 rounded font-bold text-amber-200 sm:text-white underline-offset-4 hover:underline shrink-0"
        >
          <span className="hidden xs:inline">Enroll now</span> <ArrowRight className="size-3 sm:size-3.5" />
        </Link>
      </div>
    </div>
  );
}
