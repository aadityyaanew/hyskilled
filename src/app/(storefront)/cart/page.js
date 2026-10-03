import { PageHeader } from "@/components/shared/page-header";
import { CartView } from "@/features/cart/cart-view";
import { buildMetadata } from "@/lib/seo";
import { ROUTES } from "@/config/routes";

export const metadata = buildMetadata({
  title: "Your Cart",
  description: "Review the courses in your cart and proceed to secure checkout.",
  path: ROUTES.cart,
  noIndex: true,
});

export default function CartPage() {
  return (
    <>
      <PageHeader
        title="Your cart"
        description="Review your selection and apply a coupon before checkout."
        breadcrumbs={[{ label: "Cart", href: ROUTES.cart }]}
      />
      <div className="container-page py-10 lg:py-14">
        <CartView />
      </div>
    </>
  );
}
