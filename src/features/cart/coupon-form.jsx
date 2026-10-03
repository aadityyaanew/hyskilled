"use client";

import { useState } from "react";
import { Check, Loader2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/features/cart/cart-provider";
import { coupons } from "@/data/coupons";

export function CouponForm() {
  const { coupon, applyCoupon, removeCoupon, items } = useCart();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    const result = await applyCoupon(code.trim());
    setLoading(false);
    if (result.valid) {
      setStatus({ type: "success", message: result.message });
      setCode("");
    } else {
      setStatus({ type: "error", message: result.message });
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
            <Check className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-emerald-900">{coupon.code} applied</p>
            <p className="truncate text-xs text-emerald-800/80">{coupon.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            removeCoupon();
            setStatus({ type: "idle", message: "" });
          }}
          aria-label="Remove coupon"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="coupon-code" className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Tag className="size-4 text-primary" />
        Have a coupon?
      </label>
      <div className="flex gap-2">
        <Input
          id="coupon-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (status.type !== "idle") setStatus({ type: "idle", message: "" });
          }}
          placeholder="Enter code"
          autoComplete="off"
          aria-invalid={status.type === "error"}
          aria-describedby="coupon-status"
          className="uppercase placeholder:normal-case"
        />
        <Button type="submit" variant="dark" disabled={!code.trim() || loading || items.length === 0} className="h-11">
          {loading ? <Loader2 className="animate-spin" /> : "Apply"}
        </Button>
      </div>
      <p
        id="coupon-status"
        role="status"
        className={`mt-1.5 min-h-4 text-xs ${status.type === "error" ? "font-medium text-destructive" : "text-muted-foreground"}`}
      >
        {status.type === "error" ? status.message : `Try ${coupons[0].code} or ${coupons[1].code}`}
      </p>
    </form>
  );
}
