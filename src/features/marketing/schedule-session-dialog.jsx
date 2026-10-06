"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EMPTY = { name: "", phone: "", email: "", course: "", experience: "" };
const labelCls = "mb-1 block text-[11px] sm:text-xs font-semibold text-foreground";
const errCls = "mt-0.5 text-[10px] sm:text-xs text-destructive";

export function ScheduleSessionDialog({
  children,
  syllabusUrl = null,
  defaultCourse = "",
  title = "Schedule your session",
  description = "Tell us a bit about yourself and we'll get back to you to book a free session.",
  autoOpen = false,
  source = "schedule_session"
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY, course: defaultCourse });
  const [courses, setCourses] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open || courses.length) return;
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .catch(() => { });
  }, [open, courses.length]);

  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => setOpen(true), 500); // Small delay to let page load first
      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const onOpenChange = (next) => {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        setDone(false);
        setForm({ ...EMPTY, course: defaultCourse });
        setErrors({});
        setFormError("");
      }, 200);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, notes: form.experience, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors || {});
        setFormError(data.message || "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90svh] w-[95vw] overflow-y-auto sm:w-full sm:max-w-lg !top-[5%] !translate-y-0 sm:!top-1/2 sm:!-translate-y-1/2 sm:max-h-[92dvh] p-4 sm:p-6 gap-3 sm:gap-4">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-7" />
            </span>
            <DialogTitle className="text-xl font-bold">Request received!</DialogTitle>
            <DialogDescription>
              Thanks, {form.name.split(" ")[0]}. Our team will contact you shortly to confirm your
              session.
            </DialogDescription>
            {syllabusUrl ? (
              <Button asChild variant="brand" className="mt-3">
                <a href={syllabusUrl} target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)}>
                  Open Official Syllabus (PDF)
                </a>
              </Button>
            ) : (
              <Button variant="brand" className="mt-3" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            )}
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-1.5 sm:space-y-2">
              <span className="hidden sm:grid mx-auto size-11 place-items-center rounded-xl bg-brand-50 text-primary">
                <CalendarCheck className="size-5" />
              </span>
              <div className="flex items-center gap-2 sm:block sm:gap-0">
                <CalendarCheck className="size-5 text-primary sm:hidden" />
                <DialogTitle className="text-lg sm:text-xl font-bold">{title}</DialogTitle>
              </div>
              <DialogDescription className="hidden sm:block">
                {description}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submit} className="space-y-2.5 sm:space-y-4 mt-2 sm:mt-0" noValidate>
              <div>
                <label className={labelCls} htmlFor="lead-name">Full name *</label>
                <Input id="lead-name" value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" className="h-9 sm:h-10 text-sm" />
                {errors.name && <p className={errCls}>{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="lead-phone">Phone *</label>
                  <Input id="lead-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="+91" autoComplete="tel" className="h-9 sm:h-10 text-sm" />
                  {errors.phone && <p className={errCls}>{errors.phone}</p>}
                </div>
                <div>
                  <label className={labelCls} htmlFor="lead-email">Email *</label>
                  <Input id="lead-email" type="email" value={form.email} onChange={set("email")} placeholder="you@mail.com" autoComplete="email" className="h-9 sm:h-10 text-sm" />
                  {errors.email && <p className={errCls}>{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className={labelCls} htmlFor="lead-course">Course *</label>
                <select
                  id="lead-course"
                  value={form.course}
                  onChange={set("course")}
                  className="h-9 sm:h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.slug} value={c.title}>{c.title}</option>
                  ))}
                  <option value="Not sure yet / Other">Not sure yet / Other</option>
                </select>
                {errors.course && <p className={errCls}>{errors.course}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="lead-experience">Experience *</label>
                <select
                  id="lead-experience"
                  value={form.experience}
                  onChange={set("experience")}
                  className="h-9 sm:h-10 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                >
                  <option value="">Select your experience</option>
                  <option value="Working Professional - Technical Roles">Working Professional - Technical Roles</option>
                  <option value="Working Professional - Non Technical">Working Professional - Non Technical</option>
                  <option value="College Student - Final Year">College Student - Final Year</option>
                  <option value="College Student - 1st to Pre-final Year">College Student - 1st to Pre-final Year</option>
                  <option value="Others">Others</option>
                </select>
                {errors.experience && <p className={errCls}>{errors.experience}</p>}
              </div>

              {formError && !Object.keys(errors).length && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
              )}

              <Button type="submit" variant="brand" className="w-full h-9 sm:h-11 mt-1" disabled={submitting}>
                {submitting ? <><Loader2 className="animate-spin size-4 mr-2" /> Submitting…</> : "Request session"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
