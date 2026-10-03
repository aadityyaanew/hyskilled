"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/brand-icons";
import { Loader2 } from "lucide-react";

export function SocialLogin({ label = "Continue with Google", className = "" }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`;
  };

  return (
    <Button
      id="auth-google"
      type="button"
      variant="outline"
      size="xl"
      disabled={isLoading}
      className={`w-full gap-3 border-2 border-border bg-white text-base font-semibold shadow-sm hover:border-brand-300 hover:bg-brand-50/50 ${className}`}
      onClick={handleGoogleSignIn}
    >
      {isLoading ? (
        <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <GoogleIcon className="size-5 shrink-0" />
      )}
      <span>{isLoading ? "Redirecting..." : label}</span>
    </Button>
  );
}
