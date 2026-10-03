import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/config/routes";

export default function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ink p-5 sm:p-10 text-white">
      {/* Background Effects */}
      <div aria-hidden className="bg-grid-dark pointer-events-none absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-32 size-[34rem] rounded-full bg-primary/40 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-40 size-[30rem] rounded-full bg-brand-600/30 blur-[120px]" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-6">
          <Logo tone="white" height={48} priority />
        </div>

        {/* Light Modal */}
        <main
          id="main-content"
          className="rounded-3xl border border-border bg-card p-8 shadow-2xl text-foreground sm:p-10"
        >
          {children}
        </main>

        <div className="mt-8 flex justify-center">
          <Link
            href={ROUTES.home}
            className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
