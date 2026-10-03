"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock, LogIn, ShieldCheck, ShoppingBag, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { CartItem } from "@/features/cart/cart-item";
import { CouponForm } from "@/features/cart/coupon-form";
import { TotalsBreakdown } from "@/features/cart/totals-breakdown";
import { useCart } from "@/features/cart/cart-provider";
import { useAuth } from "@/features/auth/auth-provider";
import { PaymentMethodSelector } from "@/features/checkout/payment-method-selector";
import { PaymentSandboxDialog } from "@/features/checkout/payment-sandbox-dialog";
import { checkoutSchema } from "@/schemas/forms.schema";
import { createPaymentOrder, getPaymentAdapter, verifyPayment } from "@/services/client/payments.client";
import { ordersRepository } from "@/services/client/orders.client";
import { formatPrice } from "@/lib/format";
import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { siteConfig } from "@/config/site";

function Step({ n, title, children }) {
  return (
    <section className="rounded-3xl border bg-card p-6 sm:p-8">
      <h2 className="mb-6 flex items-center gap-3 font-heading text-xl font-bold text-ink">
        <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { items, totals, coupon, clear, removeItem, hydrated } = useCart();
  const { user, isAuthenticated, hydrated: authReady } = useAuth();

  const [order, setOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", paymentMethod: "upi", agree: false },
  });

  // prefill from the signed-in user
  useEffect(() => {
    if (!user) return;
    if (!getValues("name")) setValue("name", user.name);
    if (!getValues("email")) setValue("email", user.email);
    if (!getValues("phone") && user.phone) setValue("phone", user.phone);
  }, [user, getValues, setValue]);

  async function finalize(currentOrder, result) {
    if (result.status === "paid") {
      try {
        const verification = await verifyPayment({
          orderId: currentOrder.id,
          provider: currentOrder.provider,
          paymentId: result.paymentId,
        });
        ordersRepository.update(currentOrder.id, {
          status: "paid",
          paymentId: verification.paymentId,
          paidAt: new Date().toISOString(),
        });
        setRedirecting(true);
        setDialogOpen(false);
        clear();
        router.push(ROUTES.orderSuccess(currentOrder.id));
        return;
      } catch {
        result = { status: "failed", reason: "verification_failed" };
      }
    }
    ordersRepository.update(currentOrder.id, { status: "failed", failureReason: result.reason ?? "payment_failed" });
    setRedirecting(true);
    setDialogOpen(false);
    router.push(ROUTES.orderFailed(currentOrder.id, result.reason ?? "payment_failed"));
  }

  async function onSubmit(values) {
    try {
      const { order: created } = await createPaymentOrder({
        items: items.map(({ type, slug }) => ({ type, slug })),
        couponCode: coupon?.code,
        customer: { name: values.name, email: values.email, phone: values.phone },
        paymentMethod: values.paymentMethod,
        provider: env.paymentProvider,
      });
      ordersRepository.save(created);
      setOrder(created);

      const adapter = getPaymentAdapter();
      if (adapter.ui === "dialog") {
        setDialogOpen(true);
      } else {
        const result = await adapter.launch(created, { method: values.paymentMethod });
        await finalize(created, result);
      }
    } catch (error) {
      toast.error("We couldn't start your payment", {
        description: error?.message ?? "Please try again in a moment.",
      });
    }
  }

  if (!hydrated || !authReady) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_26rem]">
        <div className="skeleton-shimmer h-[34rem] rounded-3xl" />
        <div className="skeleton-shimmer h-96 rounded-3xl" />
      </div>
    );
  }

  if (items.length === 0 && !redirecting) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out yet"
        description="Add a course to your cart to continue."
        action={
          <Button asChild size="lg" variant="brand">
            <Link href={ROUTES.courses}>Browse courses</Link>
          </Button>
        }
      />
    );
  }

  const payLabel = `Pay ${formatPrice(totals.total, { precise: !Number.isInteger(totals.total) })}`;

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_27rem]"
      >
        <div className="space-y-6">
          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 px-5 py-4 text-sm">
              <p className="font-medium text-ink-soft">Already have a Hyskilled account?</p>
              <Button asChild size="sm" variant="outline">
                <Link href={ROUTES.login(ROUTES.checkout)}>
                  <LogIn /> Log in
                </Link>
              </Button>
            </div>
          )}

          <Step n={1} title="Your details">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="name" label="Full name" error={errors.name?.message} className="sm:col-span-2">
                <Input id="name" autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} aria-describedby="name-error" {...register("name")} />
              </FormField>
              <FormField id="email" label="Email address" error={errors.email?.message} hint="Use this email to log in to the Hyskilled app.">
                <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby="email-error" {...register("email")} />
              </FormField>
              <FormField id="phone" label="Mobile number" error={errors.phone?.message} hint="For payment & order updates.">
                <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" aria-invalid={Boolean(errors.phone)} aria-describedby="phone-error" {...register("phone")} />
              </FormField>
            </div>
            <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-muted/60 p-3.5 text-xs text-muted-foreground">
              <Smartphone className="mt-0.5 size-4 shrink-0 text-primary" />
              Your courses will unlock in the {siteConfig.app.name} for the account that uses this email.
            </p>
          </Step>

          <Step n={2} title="Payment method">
            <PaymentMethodSelector control={control} error={errors.paymentMethod?.message} />
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5 text-emerald-600" />
              You'll complete the payment securely on the next step. We never store your card details.
            </p>
          </Step>

          <div>
            <Controller
              control={control}
              name="agree"
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox id="agree" checked={field.value} onCheckedChange={field.onChange} aria-invalid={Boolean(errors.agree)} className="mt-0.5" />
                  <label htmlFor="agree" className="cursor-pointer text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href={ROUTES.terms} target="_blank" className="font-semibold text-primary hover:underline">
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href={ROUTES.refundPolicy} target="_blank" className="font-semibold text-primary hover:underline">
                      Refund Policy
                    </Link>
                    .
                  </label>
                </div>
              )}
            />
            {errors.agree && (
              <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                {errors.agree.message}
              </p>
            )}
          </div>
        </div>

        {/* summary */}
        <aside className="space-y-5 lg:sticky lg:top-24" aria-label="Order summary">
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink">Order summary</h2>
              <Link href={ROUTES.cart} className="focus-ring rounded text-sm font-semibold text-primary hover:underline">
                Edit cart
              </Link>
            </div>
            <ul className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} onRemove={removeItem} compact removable={items.length > 1} />
              ))}
            </ul>
            <div className="my-6 border-t" />
            <CouponForm />
            <div className="my-6 border-t" />
            <TotalsBreakdown totals={totals} couponCode={coupon?.code} />

            <Button type="submit" size="xl" variant="brand" className="mt-6 w-full" disabled={isSubmitting || redirecting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" /> Preparing payment…
                </>
              ) : (
                <>
                  <Lock /> {payLabel}
                </>
              )}
            </Button>

            <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-600" /> {siteConfig.guarantee.label}
              </li>
              <li className="flex items-center gap-2">
                <Lock className="size-3.5 text-emerald-600" /> 256-bit encrypted payment
              </li>
            </ul>
          </div>

          <Link href={ROUTES.courses} className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> Continue shopping
          </Link>
        </aside>
      </form>

      <PaymentSandboxDialog
        order={order}
        open={dialogOpen}
        onResult={(result) => finalize(order, result)}
        onCancel={() => {
          setDialogOpen(false);
          if (order) ordersRepository.update(order.id, { status: "cancelled" });
          toast.info("Payment cancelled", { description: "Your cart is safe — you can try again anytime." });
        }}
      />
    </>
  );
}
