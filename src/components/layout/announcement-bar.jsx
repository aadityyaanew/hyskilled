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
      <div className="container-page relative flex min-h-10 items-center justify-center gap-2 py-2 text-center text-[13px] font-medium">
        <Zap className="hidden size-4 shrink-0 text-amber-300 sm:block" />
        <p>
          {announcement.text}{" "}
          {announcement.code && (
            <code className="rounded bg-white/15 px-1.5 py-0.5 font-bold tracking-wide">
              {announcement.code}
            </code>
          )}
        </p>
        <Link
          href={ROUTES.courses}
          className="focus-ring hidden items-center gap-1 rounded font-bold underline-offset-4 hover:underline sm:inline-flex"
        >
          Shop now <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
