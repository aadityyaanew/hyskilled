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
import { loginSchema } from "@/schemas/forms.schema";
import { ROUTES } from "@/config/routes";

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, hydrated } = useAuth();
  const { next, target } = useSafeNext();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", remember: true },
  });

  useEffect(() => {
    if (hydrated && isAuthenticated && !isSubmitting) router.replace(target);
  }, [hydrated, isAuthenticated, isSubmitting, router, target]);

  async function onSubmit(values) {
    try {
      const { user } = await login(values);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      router.replace(target);
    } catch (error) {
      setError(error.field ?? "root", { message: error.message ?? "Something went wrong. Please try again." });
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink sm:text-4xl">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">Log in to manage your orders and account.</p>

      <div className="mt-8">
        <SocialLogin />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5" aria-label="Log in">
          {errors.root && (
            <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
              {errors.root.message}
            </p>
          )}
          <FormField id="login-email" label="Email address" error={errors.email?.message}>
            <Input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby="login-email-error" {...register("email")} />
          </FormField>
          <FormField
            id="login-password"
            label="Password"
            error={errors.password?.message}
            labelAction={
              <Link href={ROUTES.forgotPassword} className="focus-ring rounded text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            }
          >
            <PasswordInput id="login-password" autoComplete="current-password" placeholder="Enter your password" aria-invalid={Boolean(errors.password)} aria-describedby="login-password-error" {...register("password")} />
          </FormField>

          <Controller
            control={control}
            name="remember"
            render={({ field }) => (
              <div className="flex items-center gap-2.5">
                <Checkbox id="login-remember" checked={field.value} onCheckedChange={field.onChange} />
                <label htmlFor="login-remember" className="cursor-pointer text-sm text-muted-foreground">
                  Keep me signed in
                </label>
              </div>
            )}
          />

          <Button id="login-submit" type="submit" size="xl" variant="brand" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Logging in…
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to Hyskilled?{" "}
        <Link href={ROUTES.register(next)} className="focus-ring rounded font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
