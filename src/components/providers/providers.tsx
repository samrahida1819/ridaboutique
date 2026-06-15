"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ShopProvider } from "@/components/providers/shop-provider";
import { ToastProvider } from "@/components/providers/toast-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ShopProvider>{children}</ShopProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
