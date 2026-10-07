import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AlertCircle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { query, isDbConfigured } from "@/lib/db";
import EnrollmentDocForm from "@/features/enrollment/enrollment-doc-form";

export async function generateMetadata() {
  return {
    title: "Complete Your Enrollment | Hyskilled",
    description: "Submit your enrollment documentation to complete your admission at Hyskilled.",
    robots: { index: false, follow: false },
  };
}

async function getOrderDetails(orderId) {
  if (!isDbConfigured()) return null;
  try {
    const rows = await query(
      `SELECT o.id, o.customer_name, o.customer_email, o.customer_phone,
              o.total, o.status,
              oi.item_slug, oi.title as item_title,
              c.price as course_price,
              (SELECT 1 FROM enrollment_docs ed WHERE ed.order_id = o.id LIMIT 1) as already_submitted
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id AND oi.item_type = 'course'
       LEFT JOIN courses c ON (c.slug = oi.item_slug OR c.title = oi.item_title)
       WHERE o.id = ? AND o.status = 'paid'
       LIMIT 1`,
      [orderId]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export default async function EnrollmentDocPage({ params }) {
  const { orderId } = await params;
  const isDb = isDbConfigured();
  const order = isDb ? await getOrderDetails(orderId) : null;

  // If DB is configured but no paid order found → 404
  if (isDb && !order) {
    notFound();
  }

  // Already submitted guard
  if (order?.already_submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-3xl border bg-card p-10 text-center shadow-soft">
          <Badge variant="success" className="mb-4">Already Submitted</Badge>
          <h1 className="font-heading text-2xl font-bold text-ink">Documentation Already Received</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We have already received your enrollment documentation for this order. Our team is reviewing it and will contact you at{" "}
            <strong>{order.customer_email}</strong> shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 px-4 py-12 sm:py-16">
      {/* Page Header */}
      <div className="mx-auto max-w-3xl text-center mb-10">
        <Badge variant="soft" className="mb-3">Enrollment Documentation</Badge>
        <h1 className="font-heading text-3xl font-bold text-ink sm:text-4xl">
          Complete Your Enrollment Documentation
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:text-base max-w-xl mx-auto">
          Thank you for choosing Hyskilled
          {order?.customer_name ? `, ${order.customer_name}` : ""}. Please provide the following
          details and documents to complete your enrollment verification.
        </p>

        {/* Important notice */}
        <div className="mt-5 inline-flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-left">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            <span className="font-semibold">Important:</span> Batch allocation will take place only after
            100% of the applicable tuition fee has been paid and successfully verified.
          </p>
        </div>

        {/* Course chip */}
        {order?.item_title && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm">
            <BookOpen className="size-4 text-primary" />
            {order.item_title}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl">
        <Suspense>
          <EnrollmentDocForm
            orderId={orderId}
            initialCourse={order?.item_title || ""}
            totalFee={order?.course_price || order?.total || ""}
            paidAmount={order?.total || ""}
          />
        </Suspense>
      </div>
    </div>
  );
}
