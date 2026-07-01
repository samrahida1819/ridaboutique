import { AuthCallbackClient } from "@/components/auth/auth-callback-client";

export default async function AuthCallbackPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <AuthCallbackClient nextPath={next || "/account"} />;
}
