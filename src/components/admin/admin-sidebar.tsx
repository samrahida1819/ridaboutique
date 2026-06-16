"use client";

export type AdminModuleLabel =
  | "Dashboard"
  | "Products"
  | "Orders"
  | "Customers"
  | "Categories"
  | "Banners"
  | "Content"
  | "Contact Details"
  | "Settings";

export const adminModules: Array<{ label: AdminModuleLabel }> = [
  { label: "Dashboard" },
  { label: "Products" },
  { label: "Orders" },
  { label: "Customers" },
  { label: "Categories" },
  { label: "Banners" },
  { label: "Content" },
  { label: "Contact Details" },
  { label: "Settings" }
];

export function AdminSidebar() {
  return null;
}
