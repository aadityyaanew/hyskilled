"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/brand-icons";

/**
 * Social login placeholder. Wire `onClick` to your OAuth provider
 * (e.g. next-auth `signIn("google")`) when the backend is ready.
 */
export function SocialLogin({ label = "Continue with Google" }) {
  return (
    <>
      <Button
        id="auth-google"
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() =>
          toast.info("Google sign-in isn't connected yet", {
            description: "This is a placeholder — connect your OAuth provider in features/auth/social-login.jsx.",
          })
        }
      >
        <GoogleIcon /> {label}
      </Button>
      <div className="relative my-6 text-center" role="separator" aria-label="or">
        <div className="absolute inset-x-0 top-1/2 border-t" />
        <span className="relative bg-background px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          or with email
        </span>
      </div>
    </>
  );
}
