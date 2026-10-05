"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function pad(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function getTimeRemaining(targetDate) {
  if (!targetDate) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds, expired: false };
}

/**
 * Live Countdown Timer for Course Closing/Expiry.
 * Updates in real-time every second without requiring page reload.
 * Automatically marks course as closed when countdown reaches zero.
 */
export function CourseCountdown({
  closingDate,
  closingTimerEnabled = false,
  isClosed = false,
  variant = "hero", // "hero" | "card" | "purchase" | "badge"
  className,
  onExpire,
}) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(closingDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!closingTimerEnabled || !closingDate) return;

    const tick = () => {
      const remaining = getTimeRemaining(closingDate);
      setTimeLeft(remaining);
      if (remaining.expired && onExpire) {
        onExpire();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [closingDate, closingTimerEnabled, onExpire]);

  if (!closingTimerEnabled && !isClosed) {
    return null;
  }

  const courseIsClosed = isClosed || timeLeft.expired;

  // Closed State UI
  if (courseIsClosed) {
    if (variant === "card" || variant === "badge") {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm",
            className
          )}
        >
          <Lock className="size-3 text-amber-400" />
          Enrollment Closed
        </span>
      );
    }

    if (variant === "purchase") {
      return (
        <div
          className={cn(
            "rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5 text-center text-xs font-semibold text-destructive",
            className
          )}
        >
          <div className="flex items-center justify-center gap-1.5 font-bold">
            <Lock className="size-4" /> Enrollment Closed
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground font-normal">
            This course is no longer accepting new students for the current cohort.
          </p>
        </div>
      );
    }

    // Hero / Full banner
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-300 backdrop-blur-md shadow-sm",
          className
        )}
      >
        <AlertTriangle className="size-4 shrink-0 text-amber-400" />
        <span>Course Closed — Enrollment has ended for this cohort.</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  const timerString = `${pad(days)} Days : ${pad(hours)} Hours : ${pad(minutes)} Minutes : ${pad(seconds)} Seconds`;

  // Prevent SSR hydration flicker by rendering stable skeleton until mounted
  if (!mounted) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Clock className="size-3.5" />
        <span>Loading timer…</span>
      </div>
    );
  }

  // Variant: Card on Catalog / Storefront Grid
  if (variant === "card") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-brand-900/90 px-3 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md border border-brand-700/40",
          className
        )}
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
        </span>
        <span className="tracking-tight font-mono">
          {pad(days)}d : {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
        </span>
      </div>
    );
  }

  // Variant: Purchase Card (Sidebar)
  if (variant === "purchase") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/80 via-white to-brand-50/40 p-3.5 text-center shadow-sm",
          className
        )}
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand-800">
          <Clock className="size-3.5 text-primary animate-pulse" />
          <span>Limited Time Enrollment</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 font-mono text-xs font-extrabold text-ink sm:text-sm">
          <div className="flex flex-col items-center rounded-lg bg-white px-2 py-1 shadow-xs border border-border/60">
            <span>{pad(days)}</span>
            <span className="text-[9px] font-sans font-medium text-muted-foreground">Days</span>
          </div>
          <span className="font-sans font-bold text-muted-foreground">:</span>
          <div className="flex flex-col items-center rounded-lg bg-white px-2 py-1 shadow-xs border border-border/60">
            <span>{pad(hours)}</span>
            <span className="text-[9px] font-sans font-medium text-muted-foreground">Hours</span>
          </div>
          <span className="font-sans font-bold text-muted-foreground">:</span>
          <div className="flex flex-col items-center rounded-lg bg-white px-2 py-1 shadow-xs border border-border/60">
            <span>{pad(minutes)}</span>
            <span className="text-[9px] font-sans font-medium text-muted-foreground">Mins</span>
          </div>
          <span className="font-sans font-bold text-muted-foreground">:</span>
          <div className="flex flex-col items-center rounded-lg bg-white px-2 py-1 shadow-xs border border-border/60">
            <span className="text-primary">{pad(seconds)}</span>
            <span className="text-[9px] font-sans font-medium text-muted-foreground">Secs</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Course closes automatically when countdown expires.
        </p>
      </div>
    );
  }

  // Variant: Hero Banner on Course Detail Page
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs sm:text-sm text-white backdrop-blur-md shadow-lg",
        className
      )}
    >
      <div className="flex items-center gap-1.5 font-bold text-amber-300">
        <Clock className="size-3.5 sm:size-4 animate-spin-slow text-amber-400" />
        <span>Closes in:</span>
      </div>
      <span className="font-mono font-extrabold tracking-wider text-white sm:hidden">
        {pad(days)}d : {pad(hours)}h : {pad(minutes)}m : {pad(seconds)}s
      </span>
      <span className="hidden font-mono font-extrabold tracking-wider text-white sm:inline">
        {timerString}
      </span>
    </div>
  );
}
