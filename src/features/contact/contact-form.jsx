"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { contactSchema } from "@/schemas/forms.schema";

const topics = [
  { value: "courses", label: "Course questions & syllabus" },
  { value: "payments", label: "Payments, invoices & refunds" },
  { value: "app", label: "Hyskilled mobile app access" },
  { value: "corporate", label: "Teams & corporate training" },
  { value: "other", label: "General enquiry" },
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", topic: "", message: "" },
  });

  async function onSubmit(data) {
    // Simulated contact submission
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    toast.success("Message sent successfully!", {
      description: "Our advisory team will respond within 24 hours.",
    });
    reset();
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </span>
        <h3 className="mt-6 font-heading text-2xl font-bold text-ink">
          Thank you for reaching out!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We have received your enquiry. An academic counselor or support representative will get
          back to you via email shortly.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-3xl border bg-card p-6 shadow-soft sm:p-8"
      aria-label="Contact form"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="contact-name" label="Your name" error={errors.name?.message}>
          <Input
            id="contact-name"
            autoComplete="name"
            placeholder="Priya Sharma"
            aria-invalid={Boolean(errors.name)}
            aria-describedby="contact-name-error"
            {...register("name")}
          />
        </FormField>

        <FormField id="contact-email" label="Email address" error={errors.email?.message}>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="priya@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby="contact-email-error"
            {...register("email")}
          />
        </FormField>
      </div>

      <FormField id="contact-topic" label="What can we help you with?" error={errors.topic?.message}>
        <Controller
          control={control}
          name="topic"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="contact-topic" aria-invalid={Boolean(errors.topic)}>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <FormField id="contact-message" label="Your message" error={errors.message?.message}>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="Tell us about the courses you're interested in or the issue you're facing..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby="contact-message-error"
          {...register("message")}
        />
      </FormField>

      <Button
        id="contact-submit"
        type="submit"
        size="xl"
        variant="brand"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Sending message…
          </>
        ) : (
          <>
            <Send className="size-4" /> Send message
          </>
        )}
      </Button>
    </form>
  );
}
