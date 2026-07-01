import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Signup"
};

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <AuthForm mode="signup" nextPath={next || "/account"} />;
}
