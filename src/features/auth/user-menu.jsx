"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Receipt, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/auth-provider";
import { ROUTES } from "@/config/routes";
import { initials } from "@/lib/format";
import { ScheduleSessionDialog } from "@/features/marketing/schedule-session-dialog";
import { toast } from "sonner";

export function UserMenu({ className }) {
  const { user, isAuthenticated, hydrated, logout } = useAuth();
  const router = useRouter();

  if (!hydrated) {
    return <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" aria-hidden />;
  }

  if (!isAuthenticated) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={ROUTES.login()}>Log in</Link>
        </Button>
        <Button asChild variant="brand" size="sm">
          <Link href={ROUTES.courses}>Get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="focus-ring flex cursor-pointer items-center gap-2 rounded-full border bg-white p-0.5 sm:p-1 sm:pr-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
          aria-label="Open account menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-ink lg:block">
            {user.name.split(" ")[0]}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5">
        <DropdownMenuLabel className="px-2 py-2">
          <p className="truncate text-sm font-bold text-ink">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
          <Link href={ROUTES.account}>
            <Receipt /> My orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
          <Link href={`${ROUTES.account}?tab=profile`}>
            <UserRound /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg py-2">
          <Link href={ROUTES.cart}>
            <ShoppingBag /> Cart
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive"
          onSelect={async () => {
            await logout();
            toast.success("You've been logged out.");
            router.push(ROUTES.home);
          }}
        >
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
