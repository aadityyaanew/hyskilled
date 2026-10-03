import { CreditCard, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAdminOrders } from "@/services/admin.service";
import { formatPrice, formatDate } from "@/lib/format";

export const metadata = {
  title: "Orders & Sales | Admin",
};

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Orders & Transactions
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Track customer payments, invoices, GST calculations, and payment gateway statuses.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <ShoppingBag className="size-6" />
            </span>
            <p className="mt-3 font-semibold text-foreground">No orders recorded yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Customer checkouts on the storefront will appear here with live payment verification.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Mobile</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Total Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-primary">
                      {order.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                      {order.customer_phone || "—"}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap capitalize text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="size-3 text-primary" />
                        {order.payment_method || "online"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
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
                      {formatDate(order.created_at, { dateStyle: "short", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
