"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { newsletterSchema } from "@/schemas/forms.schema";

export function NewsletterForm({ tone = "dark" }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | done

  async function onSubmit(e) {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError("");
    setState("loading");
    // TODO(backend): POST /newsletter/subscribe
    await new Promise((r) => setTimeout(r, 700));
    setState("done");
    toast.success("You're subscribed!", { description: "Watch your inbox for new courses and offers." });
  }

  const dark = tone === "dark";

  if (state === "done") {
    return (
      <p className={`flex items-center gap-2 text-sm font-medium ${dark ? "text-white" : "text-ink"}`}>
        <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-white">
          <Check className="size-3.5" />
        </span>
        Thanks! You're on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={Boolean(error)}
          aria-describedby="newsletter-error"
          className={`h-11 min-w-0 flex-1 rounded-xl border px-3.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 ${
            dark
              ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-brand-400"
              : "border-input bg-white"
          }`}
        />
        <Button type="submit" variant={dark ? "brand" : "default"} className="h-11 shrink-0" disabled={state === "loading"}>
          {state === "loading" ? <Loader2 className="animate-spin" /> : <>Subscribe <ArrowRight /></>}
        </Button>
      </div>
      <p id="newsletter-error" role="alert" className="mt-1.5 min-h-4 text-xs font-medium text-brand-300">
        {error}
      </p>
    </form>
  );
}
