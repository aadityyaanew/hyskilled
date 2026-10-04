"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SettingsManager() {
  const [announcement, setAnnouncement] = useState({
    text: "Launch offer: take 20% off your first course with code",
    code: "WELCOME20",
    enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.announcement) setAnnouncement(data.announcement);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcement }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      
      setFeedback({ type: "success", message: "Settings saved successfully." });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="animate-spin size-5" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Site Settings
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Manage general site settings and configuration.
        </p>
      </div>

      {feedback.message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm font-medium shadow-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.message}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-3xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Announcement Banner</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Banner Text
            </label>
            <Input
              required
              value={announcement.text}
              onChange={(e) => setAnnouncement((p) => ({ ...p, text: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Coupon Code (Optional)
            </label>
            <Input
              value={announcement.code}
              onChange={(e) => setAnnouncement((p) => ({ ...p, code: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="banner-active"
              checked={announcement.enabled}
              onChange={(e) => setAnnouncement((p) => ({ ...p, enabled: e.target.checked }))}
              className="rounded border-input text-primary focus:ring-primary size-4"
            />
            <label htmlFor="banner-active" className="text-sm font-medium text-foreground cursor-pointer">
              Show banner on the website
            </label>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <Button type="submit" variant="brand" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="animate-spin size-4 mr-2" /> Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
