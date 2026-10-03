"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/auth-provider";
import { CartProvider } from "@/features/cart/cart-provider";

/** Single place to register every global client provider. */
export function AppProviders({ children }) {
  return (
    <TooltipProvider delayDuration={150}>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}
