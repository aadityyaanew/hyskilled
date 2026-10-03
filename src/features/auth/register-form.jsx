"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, Smartphone } from "lucide-react";
import { SocialLogin } from "@/features/auth/social-login";
import { useAuth } from "@/features/auth/auth-provider";
import { useSafeNext } from "@/features/auth/use-safe-next";
import { ROUTES } from "@/config/routes";

export function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated, hydrated } = useAuth();
  const { target } = useSafeNext();

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(target);
    }
  }, [hydrated, isAuthenticated, router, target]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" /> Start Learning Today
        </div>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Create your account</h1>
        <p className="mt-2 text-muted-foreground">
          Sign up with Google to purchase courses, track receipts, and unlock your mobile app learning access.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <SocialLogin label="Sign up with Google" />

        {process.env.NODE_ENV !== "production" && (
          <p className="text-center text-xs text-muted-foreground">
            Development mode:{" "}
            <Link
              href="/api/auth/google?mock=true"
              className="font-medium text-primary hover:underline"
            >
              Simulate Google Sign-up
            </Link>
          </p>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border bg-muted/40 p-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-ink">
          <Smartphone className="size-4 text-primary" /> Instant 2-Step Onboarding
        </div>
        <p>
          1. Connect with Google in one tap.
          <br />
          2. Provide your mobile number to link with the Hyskilled mobile app.
        </p>
        <div className="flex items-center gap-2 pt-1 font-medium text-ink">
          <ShieldCheck className="size-4 text-emerald-600" /> No Passwords Needed
        </div>
        <p>
          Your account is secured directly via your verified Google profile.
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href={ROUTES.login()} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
