import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { BackButton } from "@/components/layout/back-button";
import { PageShell } from "@/components/motion/page-shell";
import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://ridaboutique.in"),
  title: {
    default: "Rida Boutique | Luxury Ecommerce in Kashmir",
    template: "%s | Rida Boutique"
  },
  description:
    "Rida Boutique is a modern international luxury boutique based in Kashmir, offering women's fashion, custom earrings, frames, cash bouquets, hijabs, accessories, and made-to-order gifts.",
  keywords: [
    "Rida Boutique",
    "Kashmir boutique",
    "luxury fashion Kashmir",
    "custom gifts Kashmir",
    "cash bouquets Kashmir",
    "custom earrings"
  ],
  openGraph: {
    title: "Rida Boutique",
    description: "Crafted for Elegance. Designed for Every Occasion.",
    url: "https://ridaboutique.in",
    siteName: "Rida Boutique",
    locale: "en_IN",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body>
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <BackButton />
          <PageShell>{children}</PageShell>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
