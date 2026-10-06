"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Package,
  CreditCard,
  Users,
  KeyRound,
  Tag,
  ExternalLink,
  LogOut,
  Menu,
  ShieldCheck,
  Settings,
  Newspaper,
  Briefcase,
  Inbox,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/instructors", label: "Instructors", icon: GraduationCap },
  { href: "/admin/bundles", label: "Bundles", icon: Package },
  { href: "/admin/orders", label: "Orders & Sales", icon: CreditCard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/applications", label: "Applications", icon: Briefcase },
  { href: "/admin/enrollment-docs", label: "Enrollment Docs", icon: ClipboardList },
  { href: "/admin/blogs", label: "Blog", icon: Newspaper },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ adminEmail, className = "", onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
    } catch {
      toast.error("Failed to log out.");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={`flex h-full flex-col justify-between border-r border-border bg-card p-5 pb-safe overflow-y-auto ${className}`}
    >
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" onClick={() => onNavigate?.()} className="flex items-center gap-2">
            <Logo height={32} priority asLink={false} />
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-brand-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile & Actions */}
      <div className="space-y-3 pt-6 border-t border-border">
        <div className="flex items-center gap-2.5 px-2">
          <div className="grid size-8 place-items-center rounded-lg bg-ink text-xs font-bold text-white">
            <ShieldCheck className="size-4 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-foreground">Admin Panel</p>
            <p className="truncate text-[11px] text-muted-foreground">{adminEmail}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full text-xs font-medium"
            onClick={() => onNavigate?.()}
          >
            <Link href="/" target="_blank">
              <ExternalLink className="size-3.5" /> Store
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-3.5" /> Exit
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function AdminTopBar({ adminEmail }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open admin navigation">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <SheetDescription className="sr-only">Hyskilled Control Center Menu</SheetDescription>
            <AdminSidebar adminEmail={adminEmail} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        <span className="hidden text-sm font-semibold text-muted-foreground sm:inline-block">
          Hyskilled Control Center
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href="/" target="_blank">
            <ExternalLink className="size-3.5" /> Open Website
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-3.5" /> Sign out
        </Button>
      </div>
    </header>
  );
}
