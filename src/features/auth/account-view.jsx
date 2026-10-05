"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ExternalLink, Loader2, LogIn, LogOut, Package, Receipt, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { useAuth } from "@/features/auth/auth-provider";
import { useOrders } from "@/features/orders/use-order";
import { OrderStatusBadge, OrderSummaryCard } from "@/features/orders/order-summary-card";
import { phoneField } from "@/schemas/forms.schema";
import { formatDate, formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: phoneField,
});

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function OrdersTab({ email }) {
  const { orders, hydrated } = useOrders();
  const mine = useMemo(
    () => orders.filter((o) => o.customer?.email?.toLowerCase() === email.toLowerCase()),
    [orders, email]
  );

  if (!hydrated) return <div className="skeleton-shimmer h-48 rounded-3xl" />;

  if (mine.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No orders yet"
        description="When you buy a course, your receipt and payment status will show up here."
        action={
          <Button asChild variant="brand" size="lg">
            <Link href={ROUTES.courses}>Browse courses</Link>
          </Button>
        }
      />
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {mine.map((order) => (
        <AccordionItem
          key={order.id}
          value={order.id}
          className="rounded-2xl border bg-card px-5 data-[state=open]:border-brand-200"
        >
          <AccordionTrigger className="py-5 hover:no-underline">
            <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 pr-3 text-left">
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-ink">{order.id}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, { dateStyle: "medium" })}</p>
              </div>
              <p className="hidden min-w-0 flex-1 truncate text-sm text-muted-foreground sm:block">
                {order.items.map((i) => i.title).join(" · ")}
              </p>
              <div className="ml-auto flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="font-bold text-ink">
                  {formatPrice(order.totals.total, { precise: !Number.isInteger(order.totals.total) })}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <OrderSummaryCard order={order} />
            {order.status === "paid" && (
              <Button asChild variant="outline" className="mt-6">
                <a href={`${siteConfig.app.deepLinkBase}library`}>
                  Open in the app <ExternalLink />
                </a>
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function ProfileTab({ user }) {
  const { updateProfile } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: { name: user.name, phone: user.phone ?? "" },
  });

  async function onSubmit(values) {
    try {
      await updateProfile(values);
      reset(values);
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Couldn't update your profile", { description: error?.message });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-xl space-y-5 rounded-3xl border bg-card p-6 sm:p-8" aria-label="Edit profile">
      <FormField id="profile-name" label="Full name" error={errors.name?.message}>
        <Input id="profile-name" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby="profile-name-error" {...register("name")} />
      </FormField>
      <FormField id="profile-email" label="Email address" hint="This is the email you use to log in to the Hyskilled app, so it can't be changed here.">
        <Input id="profile-email" type="email" value={user.email} readOnly disabled />
      </FormField>
      <FormField id="profile-phone" label="Mobile number" error={errors.phone?.message}>
        <Input id="profile-phone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby="profile-phone-error" {...register("phone")} />
      </FormField>
      <Button id="profile-save" type="submit" variant="brand" size="lg" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" /> Saving…
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </form>
  );
}

export function AccountView() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, isAuthenticated, hydrated, logout } = useAuth();
  const [tab, setTab] = useState(params.get("tab") === "profile" ? "profile" : "orders");
  const [signingOut, setSigningOut] = useState(false);

  // Keep the tab in sync when the URL changes (e.g. user menu → "Profile").
  const urlTab = params.get("tab");
  useEffect(() => {
    if (urlTab === "profile" || urlTab === "orders") setTab(urlTab);
  }, [urlTab]);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-28 rounded-3xl" />
        <div className="skeleton-shimmer h-64 rounded-3xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={LogIn}
        title="Log in to see your account"
        description="Sign in to view your orders and manage your profile."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="brand" size="lg">
              <Link href={ROUTES.login(ROUTES.account)}>Log in</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.register(ROUTES.account)}>Create account</Link>
            </Button>
          </div>
        }
      />
    );
  }

  async function handleLogout() {
    setSigningOut(true);
    await logout();
    toast.success("You've been logged out");
    router.replace(ROUTES.home);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-3xl border bg-card p-5 sm:p-8 shadow-soft">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar className="size-14 sm:size-16 shrink-0">
            <AvatarFallback className="bg-primary text-lg sm:text-xl font-bold text-primary-foreground">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-xl sm:text-2xl font-bold text-ink">{user.name}</h2>
            <p className="truncate text-xs sm:text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto pt-2 sm:pt-0 border-t border-border sm:border-0">
          <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
            <a href={`${siteConfig.app.deepLinkBase}library`}>
              Open app <ExternalLink className="size-3.5" />
            </a>
          </Button>
          <Button id="account-logout" variant="ghost" size="sm" onClick={handleLogout} disabled={signingOut} className="flex-1 sm:flex-none">
            <LogOut className="size-3.5" /> Log out
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 h-auto gap-1 rounded-2xl p-1.5 sm:inline-flex sm:w-auto">
          <TabsTrigger value="orders" className="gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold">
            <Package className="size-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold">
            <User className="size-4" /> Profile
          </TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-6">
          <OrdersTab email={user.email} />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <ProfileTab user={user} />
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        Your courses are delivered in the {siteConfig.app.name}. Log in there with{" "}
        <strong className="text-ink">{user.email}</strong> to start learning.
      </p>
    </div>
  );
}
