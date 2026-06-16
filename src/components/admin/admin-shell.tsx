"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  Contact,
  Home,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users,
  FileText
} from "lucide-react";
import { AdminOnlyMessage, AuthLoading, useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/providers/theme-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Boxes },
  { label: "Banners", href: "/admin/banners", icon: ImageIcon },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Contact Details", href: "/admin/contact-details", icon: Contact },
  { label: "Settings", href: "/admin/settings", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authReady, isAuthenticated, signOut, user } = useAuth();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!authReady) {
    return (
      <main className="min-h-screen bg-stone-100 p-6 dark:bg-neutral-950">
        <AuthLoading />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-stone-100 p-6 dark:bg-neutral-950">
        <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-md place-items-center">
          <div className="w-full rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <LayoutDashboard className="mx-auto size-9" />
            <h1 className="mt-4 text-2xl font-semibold">Admin login required</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-stone-600 dark:text-stone-300">
              Use the separate admin login to access dashboard tools.
            </p>
            <ButtonLink className="mt-6" href={`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`}>
              Admin Login
            </ButtonLink>
          </div>
        </div>
      </main>
    );
  }

  if (user?.role !== "admin") {
    return (
      <main className="min-h-screen bg-stone-100 p-6 dark:bg-neutral-950">
        <AdminOnlyMessage />
      </main>
    );
  }

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
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
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
            <div className="relative hidden min-w-0 max-w-md flex-1 md:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <Input className="h-10 pl-9" placeholder="Search dashboard" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle compact />
              <div className="hidden text-right text-xs sm:block">
                <p className="font-semibold">{user.name}</p>
                <p className="text-stone-500">{user.email}</p>
              </div>
              <Button onClick={() => void signOut()} size="icon" variant="outline">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => (
              <button
                className={cn(
                  "shrink-0 rounded-md border border-stone-200 bg-white px-3 py-2 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-950",
                  pathname === item.href && "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                )}
                key={item.href}
                onClick={() => router.push(item.href)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
