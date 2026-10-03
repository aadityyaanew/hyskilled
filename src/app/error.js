"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log unexpected runtime errors
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/20 px-6 py-12 text-center">
      <div className="max-w-md space-y-6">
        <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-destructive/10 text-destructive shadow-soft">
          <AlertTriangle className="size-10" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-destructive">
          Something went wrong
        </p>

        <h1 className="font-heading text-3xl font-extrabold text-ink sm:text-4xl">
          An unexpected error occurred
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          We encountered an issue while loading this page. You can try refreshing the page or head
          back to safety.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button type="button" variant="brand" size="lg" onClick={() => reset()}>
            <RefreshCw className="size-4" /> Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={ROUTES.home}>
              <Home className="size-4" /> Return home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
