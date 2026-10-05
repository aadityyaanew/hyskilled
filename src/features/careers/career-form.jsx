"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";

export function CareerForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setSuccess(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border bg-brand-50/50 p-12 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h3 className="mt-4 text-2xl font-bold text-ink">Application Received!</h3>
        <p className="mt-2 text-muted-foreground">
          Thank you for applying. Our team will review your application and get back to you soon.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setSuccess(false)}
        >
          Submit another application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border bg-white p-6 shadow-soft sm:p-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-ink-soft">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input id="fullName" name="fullName" required placeholder="John Doe" />
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNo" className="text-sm font-semibold text-ink-soft">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input id="phoneNo" name="phoneNo" type="tel" required placeholder="+91 9876543210" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-ink-soft">
          Email Address <span className="text-red-500">*</span>
        </label>
        <Input id="email" name="email" type="email" required placeholder="john@example.com" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-semibold text-ink-soft">
            Role Applying For <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a role</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="experience" className="text-sm font-semibold text-ink-soft">
            Experience Level <span className="text-red-500">*</span>
          </label>
          <select
            id="experience"
            name="experience"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select experience</option>
            <option value="Fresher">Fresher</option>
            <option value="Up to 2 years">Up to 2 years</option>
            <option value="Up to 5 years">Up to 5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="resume" className="text-sm font-semibold text-ink-soft">
          Upload Resume (PDF/DOC) <span className="text-red-500">*</span>
        </label>
        <Input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          required
          className="cursor-pointer bg-muted/40 hover:bg-muted/80 transition-colors"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
          Submit Application
        </Button>
      </div>
    </form>
  );
}
