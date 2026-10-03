"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { authService } from "@/services/client/auth.client";
import { forgotPasswordSchema } from "@/schemas/forms.schema";
import { ROUTES } from "@/config/routes";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }) {
    await authService.requestPasswordReset({ email });
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="text-center sm:text-left">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-primary sm:mx-0">
          <MailCheck className="size-8" />
        </span>
        <h1 className="mt-6 text-3xl font-bold text-ink sm:text-4xl">Check your inbox</h1>
        <p className="mt-3 text-muted-foreground">
          If an account exists for <strong className="text-ink">{sentTo}</strong>, we've sent a link to reset your password.
          It can take a few minutes to arrive.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="brand">
            <Link href={ROUTES.login()}>Back to log in</Link>
          </Button>
          <Button type="button" size="lg" variant="outline" onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">Forgot your password?</h1>
      <p className="mt-2 text-muted-foreground">Enter your email and we'll send you a link to reset it.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5" aria-label="Reset password">
        <FormField id="forgot-email" label="Email address" error={errors.email?.message}>
          <Input id="forgot-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby="forgot-email-error" {...register("email")} />
        </FormField>
        <Button id="forgot-submit" type="submit" size="xl" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <Link href={ROUTES.login()} className="focus-ring mt-8 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Back to log in
      </Link>
    </div>
  );
}
