import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login"
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
