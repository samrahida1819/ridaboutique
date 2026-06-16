import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Signup"
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
