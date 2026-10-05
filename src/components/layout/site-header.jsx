"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/logo";
import { CategoryIcon } from "@/features/categories/category-icon";
import { CartButton } from "@/features/cart/cart-button";
import { UserMenu } from "@/features/auth/user-menu";
import { useAuth } from "@/features/auth/auth-provider";
import { SearchDialog } from "@/features/search/search-dialog";
import { ScheduleSessionDialog } from "@/features/marketing/schedule-session-dialog";
import { useScrolled } from "@/hooks/use-scrolled";
import { mainNav } from "@/config/navigation";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

function NavLink({ href, children, className }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring relative inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-800",
        active && "text-brand-800",
        className
      )}
    >
      {children}
      {active && (
        <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary" />
      )}
    </Link>
  );
}

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";

export function SiteHeader({ categories }) {
  const scrolled = useScrolled(8);
  const pathname = usePathname();
  const { user, isAuthenticated, hydrated, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-transparent transition-all duration-300",
          scrolled ? "glass border-border shadow-soft" : "bg-white"
        )}
      >
        <div className="container-page flex h-16 items-center gap-2 sm:gap-4 lg:h-[4.5rem]">
          {/* mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>

          <Logo priority height={36} className="h-9 sm:h-[42px] lg:h-[46px]" />

          {/* desktop nav */}
          <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 lg:flex">
            <NavigationMenu viewport={false} className="max-w-none">
              <NavigationMenuList className="gap-1">
                {mainNav.map((item) =>
                  item.mega ? (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuTrigger className="h-9 rounded-lg bg-transparent px-3 text-sm font-semibold text-ink-soft hover:bg-brand-50 hover:text-brand-800 data-open:bg-brand-50 data-open:text-brand-800">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[min(760px,92vw)] rounded-2xl border bg-white p-0 shadow-lift ring-0">
                        <div className="grid grid-cols-[1fr_15rem]">
                          <ul className="grid grid-cols-2 gap-1 p-3">
                            {categories.map((c) => (
                              <li key={c.slug}>
                                <Link
                                  href={ROUTES.category(c.slug)}
                                  className="focus-ring group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-brand-50"
                                >
                                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary transition-colors group-hover:bg-white">
                                    <CategoryIcon name={c.icon} className="size-5" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-sm font-bold text-ink">{c.short}</span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                      {c.courseCount} {c.courseCount === 1 ? "course" : "courses"}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <div className="relative flex flex-col justify-between overflow-hidden rounded-r-2xl bg-ink p-5 text-white">
                            <div
                              aria-hidden
                              className="absolute -top-10 -right-10 size-40 rounded-full bg-brand-500/40 blur-2xl"
                            />
                            <div className="relative">
                              <p className="text-xs font-bold tracking-wider text-brand-300 uppercase">
                                Career tracks
                              </p>
                              <p className="mt-2 font-heading text-lg leading-snug font-bold">
                                Choose your Planned Program and get upto 45%
                              </p>
                            </div>
                            <Link
                              href={ROUTES.pricing}
                              className="focus-ring relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-brand-200"
                            >
                              Program Plans <ArrowRight className="size-4" />
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-b-2xl border-t bg-muted/50 px-5 py-3">
                          <span className="text-xs text-muted-foreground">
                            Learn on the Hyskilled app, anywhere.
                          </span>
                          <Link
                            href={ROUTES.courses}
                            className="focus-ring inline-flex items-center gap-1 rounded text-sm font-semibold text-primary hover:underline"
                          >
                            Browse all courses <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.href}>
                      <NavLink href={item.href}>{item.label}</NavLink>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="focus-ring hidden h-10 w-56 cursor-pointer items-center gap-2 rounded-xl border bg-muted/60 px-3 text-sm text-muted-foreground transition-colors hover:border-brand-300 hover:bg-white xl:flex"
              aria-label="Search courses"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Search courses…</span>
              <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 xl:hidden"
              onClick={() => setSearchOpen(true)}
              aria-label="Search courses"
            >
              <Search className="size-5" />
            </Button>
            <CartButton />
            <div className="ml-0.5">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* mobile drawer navigation */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="flex w-[88%] max-w-sm flex-col gap-0 overflow-y-auto p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          
          <div className="border-b p-5">
            <Logo height={38} />
          </div>

          {/* User profile card in drawer if authenticated */}
          {hydrated && isAuthenticated && user && (
            <div className="border-b bg-brand-50/50 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-11 border border-brand-200">
                  <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button asChild size="sm" variant="outline" className="w-full text-xs">
                  <Link href={ROUTES.account} onClick={closeMenu}>My Orders</Link>
                </Button>
                <Button asChild size="sm" variant="brand" className="w-full text-xs">
                  <Link href={`${ROUTES.account}?tab=profile`} onClick={closeMenu}>Profile</Link>
                </Button>
              </div>
            </div>
          )}

          <nav aria-label="Mobile Navigation" className="flex-1 space-y-6 p-5">
            <div>
              <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Explore
              </p>
              <ul className="space-y-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="focus-ring flex items-center justify-between rounded-xl px-3 py-2.5 text-base font-semibold text-ink hover:bg-brand-50 active:bg-brand-100"
                    >
                      {item.label}
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Categories
              </p>
              <ul className="space-y-0.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={ROUTES.category(c.slug)}
                      onClick={closeMenu}
                      className="focus-ring flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-brand-50 active:bg-brand-100"
                    >
                      <span className="flex items-center gap-3">
                        <CategoryIcon name={c.icon} className="size-4 text-primary" />
                        {c.short}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.courseCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 px-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Company
              </p>
              <ul className="space-y-0.5">
                {[
                  { label: "About Us", href: ROUTES.about },
                  { label: "Careers", href: "/careers" },
                  { label: "Hire From Us", href: ROUTES.hireFromUs },
                  { label: "Blog", href: ROUTES.blog },
                  { label: "FAQs", href: ROUTES.faq },
                  { label: "Contact Us", href: ROUTES.contact },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="focus-ring flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-brand-50"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="space-y-2 border-t bg-muted/40 p-5 pb-safe">
            {hydrated && isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  closeMenu();
                  await logout();
                }}
              >
                Log out
              </Button>
            ) : (
              <>
                <ScheduleSessionDialog>
                  <Button variant="brand" size="lg" className="w-full">
                    Schedule Free Session
                  </Button>
                </ScheduleSessionDialog>
                <Button asChild variant="outline" size="lg" className="w-full" onClick={closeMenu}>
                  <Link href={ROUTES.login()}>Log in</Link>
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating/Docked Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenSearch={() => setSearchOpen(true)} />
    </>
  );
}
