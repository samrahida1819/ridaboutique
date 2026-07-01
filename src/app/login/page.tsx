import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Login"
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <AuthForm mode="login" nextPath={next || "/account"} />;
}
