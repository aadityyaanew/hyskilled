"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/features/auth/password-input";
import { SocialLogin } from "@/features/auth/social-login";
import { useAuth } from "@/features/auth/auth-provider";
import { useSafeNext } from "@/features/auth/use-safe-next";
import { registerSchema } from "@/schemas/forms.schema";
import { ROUTES } from "@/config/routes";

export function RegisterForm() {
  const router = useRouter();
  const { register: signUp, isAuthenticated, hydrated } = useAuth();
  const { next, target } = useSafeNext();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", terms: false },
  });

  useEffect(() => {
    if (hydrated && isAuthenticated && !isSubmitting) router.replace(target);
  }, [hydrated, isAuthenticated, isSubmitting, router, target]);

  async function onSubmit({ name, email, phone, password }) {
    try {
      const { user } = await signUp({ name, email, phone, password });
      toast.success(`Welcome to Hyskilled, ${user.name.split(" ")[0]}!`, {
        description: "Your account is ready.",
      });
      router.replace(target);
    } catch (error) {
      setError(error.field ?? "root", { message: error.message ?? "Something went wrong. Please try again." });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">Create your account</h1>
      <p className="mt-2 text-muted-foreground">
        Use the same email in the Hyskilled app to unlock the courses you buy.
      </p>

      <div className="mt-8">
        <SocialLogin label="Sign up with Google" />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5" aria-label="Create account">
          {errors.root && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
              {errors.root.message}
            </p>
          )}
          <FormField id="register-name" label="Full name" error={errors.name?.message}>
            <Input id="register-name" autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} aria-describedby="register-name-error" {...register("name")} />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="register-email" label="Email address" error={errors.email?.message}>
              <Input id="register-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby="register-email-error" {...register("email")} />
            </FormField>
            <FormField id="register-phone" label="Mobile number" error={errors.phone?.message}>
              <Input id="register-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={Boolean(errors.phone)} aria-describedby="register-phone-error" {...register("phone")} />
            </FormField>
          </div>
          <FormField id="register-password" label="Password" error={errors.password?.message} hint="At least 8 characters, with a letter and a number.">
            <PasswordInput id="register-password" autoComplete="new-password" placeholder="Create a password" aria-invalid={Boolean(errors.password)} aria-describedby="register-password-error" {...register("password")} />
          </FormField>
          <FormField id="register-confirm" label="Confirm password" error={errors.confirmPassword?.message}>
            <PasswordInput id="register-confirm" autoComplete="new-password" placeholder="Re-enter your password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby="register-confirm-error" {...register("confirmPassword")} />
          </FormField>

          <div>
            <Controller
              control={control}
              name="terms"
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox id="register-terms" checked={field.value} onCheckedChange={field.onChange} aria-invalid={Boolean(errors.terms)} className="mt-0.5" />
                  <label htmlFor="register-terms" className="cursor-pointer text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href={ROUTES.terms} target="_blank" className="font-semibold text-primary hover:underline">
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href={ROUTES.privacy} target="_blank" className="font-semibold text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              )}
            />
            {errors.terms && (
              <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                {errors.terms.message}
              </p>
            )}
          </div>

          <Button id="register-submit" type="submit" size="xl" variant="brand" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={ROUTES.login(next)} className="focus-ring rounded font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
