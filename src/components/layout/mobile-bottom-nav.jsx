"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Search, ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/features/cart/cart-provider";
import { useAuth } from "@/features/auth/auth-provider";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function MobileBottomNav({ onOpenSearch }) {
  const pathname = usePathname();
  const { count } = useCart();
  const { isAuthenticated, user, hydrated } = useAuth();

  // Hide on checkout pages (distraction-free funnel)
  if (pathname.startsWith("/checkout")) {
    return null;
  }

  // Hide on individual course detail pages where MobilePurchaseBar is pinned
  const isCourseDetailPage =
    pathname.startsWith("/courses/") && pathname !== "/courses";
  if (isCourseDetailPage) {
    return null;
  }

  // Also hide on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isCourses = pathname === "/courses" || pathname.startsWith("/categories");
  const isCart = pathname === "/cart";
  const isAccount = pathname === "/account" || pathname.startsWith("/login");

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-40 block border-t border-border/80 bg-white/92 backdrop-blur-xl lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:bg-card/92"
      style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {/* 1. Home */}
        <Link
          href={ROUTES.home}
          aria-current={isHome ? "page" : undefined}
          className={cn(
            "group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95",
            isHome ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            <Home className={cn("size-5 transition-transform duration-200", isHome && "scale-110 stroke-[2.5px]")} />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
            )}
          </div>
          <span className={cn("mt-1 text-[10px] font-semibold tracking-tight", isHome ? "font-bold text-primary" : "text-muted-foreground")}>
            Home
          </span>
        </Link>

        {/* 2. Courses */}
        <Link
          href={ROUTES.courses}
          aria-current={isCourses ? "page" : undefined}
          className={cn(
            "group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95",
            isCourses ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            <BookOpen className={cn("size-5 transition-transform duration-200", isCourses && "scale-110 stroke-[2.5px]")} />
            {isCourses && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
            )}
          </div>
          <span className={cn("mt-1 text-[10px] font-semibold tracking-tight", isCourses ? "font-bold text-primary" : "text-muted-foreground")}>
            Courses
          </span>
        </Link>

        {/* 3. Search */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search courses"
          className="group relative flex flex-1 flex-col items-center justify-center py-1 text-muted-foreground transition-transform hover:text-foreground active:scale-95"
        >
          <div className="grid size-9 place-items-center rounded-full bg-brand-50 text-primary transition-colors group-hover:bg-brand-100">
            <Search className="size-4.5 stroke-[2.2px]" />
          </div>
          <span className="mt-0.5 text-[10px] font-semibold text-muted-foreground">
            Search
          </span>
        </button>

        {/* 4. My Learning / Cart */}
        <Link
          href={ROUTES.cart}
          aria-current={isCart ? "page" : undefined}
          className={cn(
            "group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95",
            isCart ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            <ShoppingBag className={cn("size-5 transition-transform duration-200", isCart && "scale-110 stroke-[2.5px]")} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 grid size-4.5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-card">
                {count > 9 ? "9+" : count}
              </span>
            )}
            {isCart && count === 0 && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
            )}
          </div>
          <span className={cn("mt-1 text-[10px] font-semibold tracking-tight", isCart ? "font-bold text-primary" : "text-muted-foreground")}>
            Cart
          </span>
        </Link>

        {/* 5. Account */}
        <Link
          href={hydrated && isAuthenticated ? ROUTES.account : ROUTES.login()}
          aria-current={isAccount ? "page" : undefined}
          className={cn(
            "group relative flex flex-1 flex-col items-center justify-center py-1 transition-transform active:scale-95",
            isAccount ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            <UserRound className={cn("size-5 transition-transform duration-200", isAccount && "scale-110 stroke-[2.5px]")} />
            {isAccount && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
            )}
          </div>
          <span className={cn("mt-1 text-[10px] font-semibold tracking-tight", isAccount ? "font-bold text-primary" : "text-muted-foreground")}>
            {hydrated && isAuthenticated ? "Account" : "Log In"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
