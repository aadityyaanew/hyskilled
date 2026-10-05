"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { load } from "@cashfreepayments/cashfree-js";
import {
  AlertCircle,
  CheckCircle2,
  IndianRupee,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { seatBookingSchema } from "@/schemas/forms.schema";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];

export function SeatBookingForm() {
  const [courses, setCourses] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(seatBookingSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", email: "", course: "", city: "", state: "" },
  });

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => { if (d.courses?.length) setCourses(d.courses); })
      .catch(() => {});
  }, []);

  async function onSubmit(data) {
    try {
      const res = await fetch("/api/payments/create-seat-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        toast.error(json.message || "Failed to initiate payment. Please try again.");
        return;
      }

      const cashfreeEnv = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox";
      setGatewayOpen(true);
      const cashfree = await load({ mode: cashfreeEnv });
      const result = await cashfree.checkout({
        paymentSessionId: json.paymentSessionId,
        redirectTarget: "_self",
      });
      setGatewayOpen(false);

      if (result?.error) {
        toast.error(result.error.message || "Payment failed. Please try again.");
        return;
      }

      // The gateway redirects to /register-seat/status on success;
      // if it resolves in-place (sandbox), show success state.
      setSubmitted(true);
    } catch (err) {
      setGatewayOpen(false);
      toast.error("Network error. Please try again.");
    }
  }

  if (gatewayOpen) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-3xl border bg-card p-10 text-center shadow-soft">
        <div className="relative">
          <div className="size-20 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="size-7 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-ink">Opening secure payment</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ₹2,500 booking amount · Powered by Cashfree
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-xl bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          256-bit encrypted · PCI DSS compliant
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border bg-card p-10 text-center shadow-soft">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="mt-6 font-heading text-2xl font-bold text-ink">
          Seat Booked Successfully!
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Your ₹2,500 booking amount has been received. Our team will contact you shortly to
          confirm your seat and guide you through the next steps.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-primary">
          <ShieldCheck className="size-4" /> Booking amount adjusted against tuition fees
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft sm:p-8"
      aria-label="Register your seat form"
    >
      {/* Name + Phone */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="seat-name" label="Full name" error={errors.name?.message}>
          <Input
            id="seat-name"
            autoComplete="name"
            placeholder="Priya Sharma"
            aria-invalid={Boolean(errors.name)}
            aria-describedby="seat-name-error"
            {...register("name")}
          />
        </FormField>

        <FormField id="seat-phone" label="Mobile number" error={errors.phone?.message}>
          <Input
            id="seat-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 9876543210"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby="seat-phone-error"
            {...register("phone")}
          />
        </FormField>
      </div>

      {/* Email */}
      <FormField id="seat-email" label="Email address" error={errors.email?.message}>
        <Input
          id="seat-email"
          type="email"
          autoComplete="email"
          placeholder="priya@example.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby="seat-email-error"
          {...register("email")}
        />
      </FormField>

      {/* Course */}
      <FormField id="seat-course" label="Course interested in" error={errors.course?.message}>
        <Controller
          control={control}
          name="course"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="seat-course" aria-invalid={Boolean(errors.course)}>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <SelectItem key={c.slug} value={c.title}>
                      {c.title}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="AI & Machine Learning">AI & Machine Learning</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                    <SelectItem value="Full Stack Web Development">Full Stack Web Development</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                    <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                    <SelectItem value="Other">Other / Not sure yet</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      {/* City + State */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="seat-city" label="City" error={errors.city?.message}>
          <Input
            id="seat-city"
            autoComplete="address-level2"
            placeholder="Noida"
            aria-invalid={Boolean(errors.city)}
            aria-describedby="seat-city-error"
            {...register("city")}
          />
        </FormField>

        <FormField id="seat-state" label="State" error={errors.state?.message}>
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="seat-state" aria-invalid={Boolean(errors.state)}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      {/* Note */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800 leading-relaxed">
          <span className="font-semibold">Note:</span> The ₹2,500 booking amount will be adjusted
          against the applicable tuition fees and is non-refundable.
        </p>
      </div>

      {/* Submit */}
      <Button
        id="seat-booking-submit"
        type="submit"
        size="xl"
        variant="brand"
        className="w-full text-base font-bold"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            Preparing payment…
          </>
        ) : (
          <>
            <IndianRupee className="size-5" />
            Pay ₹2,500 &amp; Reserve My Seat
          </>
        )}
      </Button>

      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-emerald-600" /> Secured by Cashfree
        </li>
        <li className="flex items-center gap-1.5">
          <Lock className="size-3.5 text-emerald-600" /> 256-bit encrypted
        </li>
      </ul>
    </form>
  );
}
