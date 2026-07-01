"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLoading, useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AuthCallbackClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function finishAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) {
          throw userError || new Error("Sign in could not be completed.");
        }

        await refreshProfile();

        if (!active) {
          return;
        }

        router.replace(nextPath.startsWith("/") ? nextPath : "/account");
      } catch (nextError) {
        if (!active) {
          return;
        }

        const message = nextError instanceof Error ? nextError.message : "Sign in could not be completed.";
        setError(message);
        router.replace(`/login?error=${encodeURIComponent(message)}`);
      }
    }

    void finishAuth();

    return () => {
      active = false;
    };
  }, [nextPath, refreshProfile, router]);

  if (error) {
    return null;
  }

  return <AuthLoading title="Finishing sign in" />;
}
