import { Breadcrumbs } from "@/components/shared/page-header";
import { CheckoutView } from "@/features/checkout/checkout-view";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Complete Enrollment",
  description: "Complete your purchase securely.",
  path: ROUTES.checkout,
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container-page py-8 lg:py-12">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "My Learning", href: ROUTES.cart },
          { label: "Complete Enrollment", href: ROUTES.checkout },
        ]}
      />
      <h1 className="mb-8 text-3xl font-bold text-ink sm:text-4xl">Complete Enrollment</h1>
      <CheckoutView />
    </div>
  );
}
