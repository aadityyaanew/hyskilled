"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/app/(auth)/layout";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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



      router.replace("/admin");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center space-y-8 w-full">
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 ring-1 ring-inset ring-brand-500/20">
            <Lock className="size-3.5" /> Admin Portal
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Admin Login
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:max-w-xs">
            Sign in using the administrator credentials.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="w-full rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-ink"
            >
              Admin Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
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
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-ink"
            >
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Lock className="size-4" />
              </span>
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="xl"
            variant="brand"
            disabled={loading}
            className="mt-4 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin size-5" /> Verifying…
              </>
            ) : (
              "Sign In to Admin Panel"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
