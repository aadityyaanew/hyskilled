"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/shared/logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both admin email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      toast.success("Welcome, Administrator!", {
        description: "Authenticated successfully via .env credentials.",
      });

      router.replace("/admin");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-ink px-4 py-12 sm:px-6 lg:px-8">
      {/* Background ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[140px]" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to Storefront
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-brand-300">
            <Lock className="size-3" /> Admin Portal
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="text-center">
            <div className="flex justify-center">
              <Logo tone="white" height={36} priority />
            </div>
            <h1 className="mt-5 font-heading text-2xl font-bold text-white">
              Admin Login
            </h1>
            <p className="mt-2 text-xs text-white/60">
              Sign in using the admin credentials configured in your environment variables.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/15 p-3.5 text-xs text-destructive-foreground"
            >
              <ShieldAlert className="size-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-medium text-white/80"
              >
                Admin Email
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Mail className="size-4" />
                </span>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="admin@hyskilled.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/15 bg-white/10 pl-10 text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-white/80"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                  <Lock className="size-4" />
                </span>
                <Input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/15 bg-white/10 pl-10 text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/40"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="brand"
              disabled={loading}
              className="mt-2 w-full text-sm font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Verifying…
                </>
              ) : (
                "Sign In to Admin Panel"
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/50 text-center">
            Credentials are authenticated directly from <code className="text-brand-300 font-mono">ADMIN_EMAIL</code> and <code className="text-brand-300 font-mono">ADMIN_PASSWORD</code> in <code className="text-brand-300 font-mono">.env.local</code>.
          </div>
        </div>
      </div>
    </div>
  );
}
