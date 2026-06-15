"use client";

import {
  BarChart3,
  Boxes,
  ClipboardList,
  Images,
  Inbox,
  FileText,
  Gift,
  Home,
  Megaphone,
  Package,
  Settings,
  Star,
  Tags,
  Undo2,
  Users,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";

export const adminModules = [
  { label: "Dashboard", icon: Home, group: "Start" },
  { label: "Orders", icon: ClipboardList, group: "Sales" },
  { label: "Products", icon: Package, group: "Products" },
  { label: "Categories", icon: Tags, group: "Products" },
  { label: "Inventory", icon: Warehouse, group: "Products" },
  { label: "Low Stock", icon: Boxes, group: "Products" },
  { label: "Custom Orders", icon: Gift, group: "Customers" },
  { label: "Messages", icon: Inbox, group: "Customers" },
  { label: "Customers", icon: Users, group: "Customers" },
  { label: "Coupons", icon: Megaphone, group: "Marketing" },
  { label: "Reviews", icon: Star, group: "Customers" },
  { label: "Returns", icon: Undo2, group: "Sales" },
  { label: "Analytics", icon: BarChart3, group: "Reports" },
  { label: "Media", icon: Images, group: "Storefront" },
  { label: "Content", icon: FileText, group: "Storefront" },
  { label: "Settings", icon: Settings, group: "Storefront" }
] as const;

export type AdminModuleLabel = (typeof adminModules)[number]["label"];

export function AdminSidebar({
  active,
  onChange
}: {
  active: string;
  onChange: (module: AdminModuleLabel) => void;
}) {
  const groups = adminModules.reduce<Record<string, typeof adminModules[number][]>>((acc, module) => {
    acc[module.group] = [...(acc[module.group] || []), module];
    return acc;
  }, {});

  return (
    <aside className="rounded border border-[#c3c4c7] bg-[#1d2327] text-[#f0f0f1] shadow-sm lg:sticky lg:top-32">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-base font-semibold">Rida Admin</p>
        <p className="mt-1 text-xs text-[#a7aaad]">Control every store area</p>
      </div>

      <nav className="no-scrollbar flex gap-1 overflow-x-auto p-2 lg:block lg:overflow-visible">
        {Object.entries(groups).map(([group, modules]) => (
          <div className="shrink-0 lg:mb-3" key={group}>
            <p className="hidden px-2 pb-1 pt-2 text-[11px] font-semibold uppercase text-[#a7aaad] lg:block">
              {group}
            </p>
            <div className="flex gap-1 lg:block">
              {modules.map((module) => {
                const Icon = module.icon;

                return (
                  <button
                    className={cn(
                      "flex h-9 shrink-0 items-center gap-2 rounded px-3 text-left text-sm transition lg:mb-1 lg:w-full",
                      active === module.label
                        ? "bg-[#2271b1] text-white"
                        : "text-[#dcdcde] hover:bg-white/10 hover:text-white"
                    )}
                    key={module.label}
                    onClick={() => onChange(module.label)}
                    type="button"
                  >
                    <Icon className="size-4" />
                    <span>{module.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
