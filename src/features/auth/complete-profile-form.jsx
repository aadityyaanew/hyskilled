"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { phoneField } from "@/schemas/forms.schema";
import { useAuth } from "@/features/auth/auth-provider";

const schema = z.object({
  phone: phoneField,
});

export function CompleteProfileForm() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { phone: "" },
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to complete setup.");
      }

      toast.success("Welcome to Hyskilled!", {
        description: "Your mobile number has been linked to your account.",
      });

      if (refreshSession) {
        await refreshSession();
      }

      router.replace(json.targetUrl || "/account");
    } catch (err) {
      setError("phone", { message: err.message });
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center space-y-8 w-full">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 ring-1 ring-inset ring-brand-500/20">
          <ShieldCheck className="size-3.5" /> One last step
        </div>
        <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Enter your phone number
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:max-w-xs">
          Please enter your mobile number to finalize your account setup.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-5">
        <FormField
          id="phone"
          label="Mobile Phone Number"
          error={errors.phone?.message}
          hint="Enter your 10-digit mobile number (e.g. 9876543210)"
        >
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-muted-foreground">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="98765 43210"
              className="pl-12"
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </div>
        </FormField>

        <Button
          type="submit"
          size="xl"
          variant="brand"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Saving details…
            </>
          ) : (
            <>
              Continue to account <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>


    </div>
  );
}
