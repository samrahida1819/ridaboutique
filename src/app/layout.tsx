import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { SiteChrome } from "@/components/layout/site-chrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://ridaboutique.in"),
  title: {
    default: "Rida Boutique | Premium Boutique Ecommerce",
    template: "%s | Rida Boutique"
  },
  description:
    "Rida Boutique is a premium boutique ecommerce store for women's fashion, hijabs, custom earrings, accessories, and thoughtful gifting.",
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
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('rida-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light'}}catch(e){}"
          }}
        />
      </head>
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
