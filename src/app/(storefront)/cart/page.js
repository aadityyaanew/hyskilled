import { PageHeader } from "@/components/shared/page-header";
import { CartView } from "@/features/cart/cart-view";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "My Learning",
  description: "Review the courses in your selected courses and proceed to secure complete enrollment.",
  path: ROUTES.cart,
  noIndex: true,
});

export default function CartPage() {
  return (
    <>
      <PageHeader
        title="My Learning"
        description="Review your selection and apply a coupon before completing enrollment."
        breadcrumbs={[{ label: "My Learning", href: ROUTES.cart }]}
      />
      <div className="container-page py-10 lg:py-14">
        <CartView />
      </div>
    </>
  );
}
