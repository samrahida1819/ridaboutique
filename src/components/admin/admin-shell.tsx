"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  Contact,
  ExternalLink,
  Home,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
  FileText
} from "lucide-react";
import { AuthLoading, useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/providers/theme-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Custom Orders", href: "/dashboard/custom-orders", icon: Sparkles },
  { label: "Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Categories", href: "/dashboard/categories", icon: Boxes },
  { label: "Banners", href: "/dashboard/banners", icon: ImageIcon },
  { label: "Content", href: "/dashboard/content", icon: FileText },
  { label: "Contact Details", href: "/dashboard/contact-details", icon: Contact },
  { label: "Settings", href: "/dashboard/settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authReady, isAuthenticated, signOut, user } = useAuth();
  const loginPath = `/dashboard/login?next=${encodeURIComponent(pathname || "/dashboard")}`;
  const isAdmin = Boolean(user && user.role === "admin" && !user.id.startsWith("testing-"));

  useEffect(() => {
    if (!authReady || pathname === "/dashboard/login") {
      return;
    }

    if (!isAuthenticated || !isAdmin) {
      router.replace(loginPath);
    }
  }, [authReady, isAdmin, isAuthenticated, loginPath, pathname, router]);

  if (pathname === "/dashboard/login") {
    return <>{children}</>;
  }

  if (!authReady || !isAuthenticated || !isAdmin || !user) {
    return (
      <main className="min-h-screen bg-stone-100 p-6 dark:bg-neutral-950">
        <AuthLoading title="Opening admin login" />
      </main>
    );
  }

  const adminUser = user;

  return (
    <div className="min-h-screen bg-stone-100 text-neutral-950 dark:bg-neutral-950 dark:text-stone-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 lg:block">
        <Link className="flex items-center gap-2 rounded-md px-2 py-3 font-semibold" href="/">
          <Home className="size-4" />
          Rida Boutique
        </Link>
        <nav className="mt-5 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-neutral-950 dark:text-stone-300 dark:hover:bg-neutral-800 dark:hover:text-white",
                  active && "bg-stone-100 text-neutral-950 dark:bg-neutral-800 dark:text-white"
                )}
                href={item.href}
                key={item.href}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 p-3 dark:border-neutral-800 dark:bg-neutral-900/95">
          <div className="flex items-center gap-3">
            <Link className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold lg:hidden" href="/">
              <Home className="size-4" />
              Rida Boutique
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <ButtonLink className="hidden sm:inline-flex" href="/" rel="noreferrer" size="sm" target="_blank" variant="outline">
                <ExternalLink className="size-4" />View store
              </ButtonLink>
              <ThemeToggle compact />
              <div className="hidden text-right text-xs md:block">
                <p className="font-semibold">{adminUser.name}</p>
                <p className="text-stone-500">{adminUser.email}</p>
              </div>
              <Button onClick={() => void signOut("/dashboard/login")} size="icon" variant="outline">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <button
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-950",
                    active && "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  )}
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  type="button"
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
