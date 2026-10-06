import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { HyskilledChatbot } from "@/features/chatbot/hyskilled-chatbot";
import { getCategories } from "@/services/categories.service";

/**
 * Marketing shell: announcement bar + header + footer + mini cart + AI chatbot.
 * Everything inside the `(storefront)` route group uses this layout.
 */
export default async function StorefrontLayout({ children }) {
  const categories = await getCategories();
  return (
    <>
      <AnnouncementBar />
      <SiteHeader categories={categories} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter categories={categories} />
      <CartDrawer />
      <HyskilledChatbot />
    </>
  );
}
