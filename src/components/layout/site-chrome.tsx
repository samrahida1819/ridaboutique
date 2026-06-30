"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/layout/back-button";
import { Footer } from "@/components/layout/footer";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Navbar } from "@/components/layout/navbar";
import { PageShell } from "@/components/motion/page-shell";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/dashboard");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="storefront-theme min-h-screen">
      <Navbar />
      <BackButton />
      <PageShell>{children}</PageShell>
      <MobileTabBar />
      <div aria-hidden="true" className="h-24 md:hidden" />
      <Footer />
    </div>
  );
}
