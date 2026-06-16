import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
