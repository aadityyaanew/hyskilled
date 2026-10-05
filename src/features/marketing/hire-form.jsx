"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMPTY = { companyName: "", contactPerson: "", email: "", phone: "", roles: "" };

export function HireForm() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.companyName || !form.email || !form.contactPerson) {
       setError("Please fill in all required fields (*).");
       return;
    }
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.contactPerson} (${form.companyName})`,
          email: form.email,
          phone: form.phone || "Not Provided",
          notes: form.roles,
          source: "hire_from_us"
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Failed to submit request.");
        return;
      }
      setDone(true);
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-50/50 p-10 text-center dark:bg-emerald-500/5 shadow-sm">
        <span className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <CheckCircle2 className="size-8" />
        </span>
        <div>
          <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">Request received!</h3>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-500">
            Thank you for reaching out. Our placement team will contact you within 24 hours to discuss your hiring needs.
          </p>
        </div>
        <Button variant="outline" className="mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-100" onClick={() => { setDone(false); setForm(EMPTY); }}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border bg-card p-6 shadow-soft sm:p-10 relative z-10">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Building2 className="size-6" />
        </span>
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink">Start Hiring</h2>
          <p className="text-sm text-muted-foreground mt-1">Fill out the form and we'll get back to you.</p>
        </div>
      </div>
      
      {error && <p className="mb-6 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</p>}
      
      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="hire-company">Company Name *</label>
            <Input id="hire-company" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="hire-person">Contact Person *</label>
            <Input id="hire-person" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} placeholder="Jane Doe" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="hire-email">Work Email *</label>
            <Input id="hire-email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane@acme.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="hire-phone">Phone Number</label>
            <Input id="hire-phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-foreground" htmlFor="hire-roles">Hiring Needs / Roles</label>
          <Textarea id="hire-roles" rows={4} value={form.roles} onChange={e => setForm({...form, roles: e.target.value})} placeholder="e.g. Looking for 3 Frontend Developers proficient in React and Next.js" className="resize-y" />
        </div>
        <Button type="submit" variant="brand" size="lg" className="w-full text-base" disabled={submitting}>
          {submitting ? <><Loader2 className="mr-2 animate-spin size-5" /> Submitting…</> : "Request to Hire"}
        </Button>
      </div>
    </form>
  );
}
