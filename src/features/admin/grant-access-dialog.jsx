"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GrantAccessDialog({ courses = [] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [note, setNote] = useState("Manual grant by admin");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !courseId) {
      toast.error("Please provide both student email and course.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/enrollments/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, courseId: Number(courseId), note }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to grant course access.");
      }

      toast.success("Mobile App Access Granted!", {
        description: `Unlocked course for ${email}. Ready in mobile app.`,
      });

      setOpen(false);
      setEmail("");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="brand" size="sm">
          <Plus className="size-4" /> Grant Manual Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <KeyRound className="size-5 text-primary" /> Grant Mobile App Access
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Learner Email *
            </label>
            <Input
              type="email"
              required
              placeholder="learner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Must match the email the learner uses to sign in to the Hyskilled mobile app.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Course to Unlock *
            </label>
            <select
              required
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm"
            >
              {courses.map((c) => (
                <option key={c.id || c.slug} value={c.id || c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Admin Note / Reason
            </label>
            <Input
              placeholder="e.g. VIP invite, Bank transfer payment, Support fix"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Granting…
                </>
              ) : (
                "Grant Access"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
