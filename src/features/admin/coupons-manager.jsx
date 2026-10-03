"use client";

import { useState } from "react";
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Percent,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format";

const DEFAULT_FORM = {
  code: "",
  description: "",
  type: "percent",
  value: 10,
  max_discount: "",
  min_order: "",
  is_active: true,
  usage_limit: "",
  expires_at: "",
};

export function CouponsManager({ initialCoupons = [] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [modalError, setModalError] = useState("");

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData(DEFAULT_FORM);
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      description: coupon.description || "",
      type: coupon.type || "percent",
      value: coupon.value || 0,
      max_discount: coupon.max_discount ?? coupon.maxDiscount ?? "",
      min_order: coupon.min_order ?? coupon.minOrder ?? "",
      is_active: Boolean(coupon.is_active),
      usage_limit: coupon.usage_limit || "",
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 10) : "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (coupon) => {
    const id = coupon.id || coupon.code;
    setTogglingId(id);
    setFeedback({ type: "", message: "" });

    const newActive = !coupon.is_active;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...coupon,
          is_active: newActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update coupon status.");
      }

      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id || c.code === coupon.code ? { ...c, is_active: newActive } : c
        )
      );

      setFeedback({
        type: "success",
        message: `Coupon "${coupon.code}" is now ${newActive ? "Active" : "Inactive"}.`,
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");
    setFeedback({ type: "", message: "" });

    const normalizedCode = formData.code.trim().toUpperCase().replace(/\s+/g, "");

    const payload = {
      ...formData,
      code: normalizedCode,
      value: Number(formData.value) || 0,
      max_discount: formData.max_discount !== "" ? Number(formData.max_discount) : null,
      min_order: formData.min_order !== "" ? Number(formData.min_order) : null,
      usage_limit: formData.usage_limit !== "" ? Number(formData.usage_limit) : null,
      expires_at: formData.expires_at || null,
    };

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id || editingCoupon.code}`
        : "/api/admin/coupons";
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save coupon.");
      }

      if (editingCoupon) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === editingCoupon.id || c.code === editingCoupon.code
              ? { ...c, ...payload, code: normalizedCode }
              : c
          )
        );
        setFeedback({
          type: "success",
          message: `Coupon "${normalizedCode}" updated successfully.`,
        });
      } else {
        setCoupons((prev) => [
          {
            ...payload,
            id: data.id,
            code: normalizedCode,
            used_count: 0,
          },
          ...prev,
        ]);
        setFeedback({
          type: "success",
          message: `Coupon "${normalizedCode}" created successfully.`,
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setFeedback({ type: "", message: "" });

    try {
      const res = await fetch(
        `/api/admin/coupons/${deleteTarget.id || deleteTarget.code}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete coupon.");
      }

      setCoupons((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id && c.code !== deleteTarget.code)
      );
      setFeedback({
        type: "success",
        message: `Coupon "${deleteTarget.code}" deleted successfully.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Discount Coupons
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage promotional discount codes applied during student checkout.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="brand" size="sm">
          <Plus className="size-4" /> Create Coupon
        </Button>
      </div>

      {/* Global Inline Feedback (No Toast) */}
      {feedback.message && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm font-medium shadow-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback({ type: "", message: "" })}
            className="opacity-70 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Grid of Coupons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <div
            key={c.id || c.code}
            className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {c.type === "percent" ? (
                    <Percent className="size-5" />
                  ) : (
                    <IndianRupee className="size-5" />
                  )}
                </span>
                <Badge variant={c.is_active ? "success" : "secondary"}>
                  {c.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="font-mono text-xl font-extrabold text-foreground tracking-wider">
                  {c.code}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                {c.description}
              </p>
            </div>

            <div>
              <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground space-y-1.5">
                <p>
                  Discount:{" "}
                  <span className="font-bold text-foreground">
                    {c.type === "percent" ? `${c.value}% OFF` : `Flat ${formatPrice(c.value)} OFF`}
                  </span>
                </p>
                {c.min_order && (
                  <p>
                    Min. Order:{" "}
                    <span className="font-medium text-foreground">{formatPrice(c.min_order)}</span>
                  </p>
                )}
                {c.max_discount && (
                  <p>
                    Max Discount:{" "}
                    <span className="font-medium text-foreground">{formatPrice(c.max_discount)}</span>
                  </p>
                )}
                {c.usage_limit && (
                  <p>
                    Usage:{" "}
                    <span className="font-medium text-foreground">
                      {c.used_count || 0} / {c.usage_limit} used
                    </span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleToggleStatus(c)}
                  disabled={togglingId === (c.id || c.code)}
                  className={`gap-1.5 text-xs ${
                    c.is_active ? "text-muted-foreground" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  <Power className="size-3.5" />
                  {c.is_active ? "Deactivate" : "Activate"}
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => openEditModal(c)}
                    className="gap-1.5 text-xs"
                  >
                    <Edit className="size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setDeleteTarget(c)}
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Discount Coupon" : "Create Discount Coupon"}
              </DialogTitle>
              <DialogDescription>
                Configure promotional codes, percentage discounts, caps, and order thresholds.
              </DialogDescription>
            </DialogHeader>

            {modalError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1">{modalError}</div>
              </div>
            )}

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Coupon Code *
                </label>
                <Input
                  required
                  value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER50, WELCOME20"
                  className="font-mono uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Description *
                </label>
                <Input
                  required
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. 20% off for all new enrolled students"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs sm:text-sm"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Discount Value {formData.type === "percent" ? "(%)" : "(₹)"} *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Max Discount Cap (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.max_discount}
                    onChange={(e) => setFormData((p) => ({ ...p, max_discount: e.target.value }))}
                    placeholder="e.g. 2000 (optional)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Min Order Value (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.min_order}
                    onChange={(e) => setFormData((p) => ({ ...p, min_order: e.target.value }))}
                    placeholder="e.g. 1999 (optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Usage Limit (Total times)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData((p) => ({ ...p, usage_limit: e.target.value }))}
                    placeholder="unlimited if empty"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Expiry Date
                  </label>
                  <Input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData((p) => ({ ...p, expires_at: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon-active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
                <label htmlFor="coupon-active" className="text-xs font-medium text-foreground cursor-pointer">
                  Activate coupon immediately for checkout
                </label>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin size-4" /> Saving…
                  </>
                ) : editingCoupon ? (
                  "Save Changes"
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete coupon{" "}
              <strong className="text-foreground">{deleteTarget?.code}</strong>? Students will no longer
              be able to apply this code at checkout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin size-4" /> Deleting…
                </>
              ) : (
                "Delete Coupon"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
