import Link from "next/link";
import { ArrowLeft, BookOpen, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-muted/20 px-6 py-12 text-center">
      <header>
        <Logo height={36} priority />
      </header>

      <main id="main-content" className="max-w-md space-y-6">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-brand-50 text-primary shadow-soft">
          <Compass className="size-10" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          404 · Page Not Found
        </p>

        <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
          We couldn't find that page
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          The link you followed might be broken, or the page may have been moved or removed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild variant="brand" size="lg">
            <Link href={ROUTES.home}>
              <Home className="size-4" /> Go to home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={ROUTES.courses}>
              <BookOpen className="size-4" /> Explore courses
            </Link>
          </Button>
        </div>
      </main>

      <footer className="text-xs text-muted-foreground">
        Need assistance?{" "}
        <Link href={ROUTES.contact} className="font-semibold text-primary hover:underline">
          Contact support
        </Link>
      </footer>
    </div>
  );
}
