"use client";

import type { ReactNode } from "react";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ShopProvider } from "@/components/providers/shop-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <ShopProvider>{children}</ShopProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
