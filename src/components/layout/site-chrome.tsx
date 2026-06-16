"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { BackButton } from "@/components/layout/back-button";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PageShell } from "@/components/motion/page-shell";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="storefront-theme min-h-screen">
      <AnnouncementBar />
      <Navbar />
      <BackButton />
      <PageShell>{children}</PageShell>
      <Footer />
    </div>
  );
}
