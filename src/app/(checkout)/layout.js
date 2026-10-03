import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/config/site";
import { ROUTES } from "@/config/routes";

/** Distraction-free shell for checkout & order-result pages. */
export default function CheckoutLayout({ children }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo priority height={32} />
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Lock className="size-4" />
            <span>Secure checkout</span>
          </p>
        </div>
      </header>
      <main id="main-content" className="flex-1 bg-muted/30">
        {children}
      </main>
      <footer className="border-t bg-white py-6 text-center text-xs text-muted-foreground">
        <div className="container-page flex flex-col items-center justify-between gap-3 sm:flex-row">

          <nav aria-label="Legal" className="flex gap-5">
            <Link href={ROUTES.terms} className="hover:text-primary">Terms</Link>
            <Link href={ROUTES.privacy} className="hover:text-primary">Privacy</Link>
            
            <Link href={ROUTES.contact} className="hover:text-primary">Help</Link>
          </nav>
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        </div>
      </footer>
    </>
  );
}
