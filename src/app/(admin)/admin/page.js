import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  BookOpen,
  ArrowUpRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Plus,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/services/admin.service";
import { formatPrice, formatDate } from "@/lib/format";

export const metadata = {
  title: "Admin Dashboard | Hyskilled",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Top Header & DB Status */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Business Overview
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Monitor sales, active learners, and course inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild size="sm" variant="brand">
            <Link href="/admin/courses/new">
              <Plus className="size-4" /> Add Course
            </Link>
          </Button>
        </div>
      </div>



      {/* KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <IndianRupee className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {formatPrice(stats.revenue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            From {stats.paidOrders} confirmed orders
          </p>
        </div>

        {/* Orders */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <ShoppingBag className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {stats.totalOrders}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Checkout attempts & completed orders
          </p>
        </div>

        {/* Students */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Learners
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {stats.students}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Google authenticated accounts
          </p>
        </div>

        {/* Courses */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Courses
            </span>
            <span className="grid size-9 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <BookOpen className="size-4" />
            </span>
          </div>
          <p className="mt-3 font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {stats.courses}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Published in catalog
          </p>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Top Selling Courses */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders (2 columns) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Recent Orders
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/admin/orders">
                View all orders <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            {stats.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No orders placed yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-semibold text-primary">
                          {order.id}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-foreground">{order.customer_name}</p>
                          <p className="text-[11px] text-muted-foreground">{order.customer_email}</p>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-foreground">
                          {formatPrice(order.total)}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              order.status === "paid"
                                ? "success"
                                : order.status === "pending"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(order.created_at, { dateStyle: "short" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Courses (1 column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Top Courses
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/admin/courses">
                Catalog <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
            {stats.topCourses.map((c) => (
              <div
                key={c.slug}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-xs text-foreground sm:text-sm">
                    {c.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="capitalize">{c.category_name}</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">{formatPrice(c.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{c.learners}</p>
                  <p className="text-[10px] text-muted-foreground">Learners</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
