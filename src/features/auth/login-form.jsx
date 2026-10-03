"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Smartphone, Zap } from "lucide-react";
import { SocialLogin } from "@/features/auth/social-login";
import { useAuth } from "@/features/auth/auth-provider";
import { useSafeNext } from "@/features/auth/use-safe-next";
import { ROUTES } from "@/config/routes";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, hydrated } = useAuth();
  const { target } = useSafeNext();
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(target);
    }
  }, [hydrated, isAuthenticated, router, target]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  // Prevent flash of form when redirecting
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="flex flex-col items-center">

        <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Sign in to Hyskilled
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:max-w-xs">
          Continue with your Google account to access your enrolled courses and order receipts.
        </p>
      </div>

      {errorParam && (
        <div
          role="alert"
          className="w-full rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {errorParam === "account_suspended"
            ? "Your account has been suspended. Please contact support."
            : errorParam === "google_credentials_missing"
            ? "Google OAuth is not configured in .env.local yet. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            : "Authentication was interrupted. Please try again."}
        </div>
      )}

      <div className="w-full pb-2">
        <SocialLogin label="Continue with Google" />
      </div>
    </div>
  );
}
