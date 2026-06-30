"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AdminLoginResponse = {
  session: {
    accessToken: string;
    refreshToken: string;
  };
};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authReady, refreshProfile, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next") || "/dashboard";
    return next.startsWith("/dashboard") && next !== "/dashboard/login" ? next : "/dashboard";
  }, [searchParams]);

  useEffect(() => {
    if (!authReady || !user) {
      return;
    }

    if (user.role === "admin") {
      router.replace(nextPath);
    }
  }, [authReady, nextPath, router, user]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<AdminLoginResponse> & {
        error?: string;
      };

      if (!response.ok || !payload.session) {
        setError(payload.error || "Admin login failed.");
        setSubmitting(false);
        return;
      }

      await getSupabaseBrowserClient().auth.setSession({
        access_token: payload.session.accessToken,
        refresh_token: payload.session.refreshToken
      });
      await refreshProfile();
      setMessage("Login successful. Opening dashboard...");
      router.replace(nextPath);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Admin login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 text-neutral-950 dark:bg-neutral-950 dark:text-stone-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <Link className="text-sm font-semibold" href="/">
            Rida Boutique
          </Link>
          <ThemeToggle compact />
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
              <LayoutDashboard className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">Admin Login</h1>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                Separate access for dashboard users.
              </p>
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={submit}>
            <Field label="Admin email">
              <Input
                autoComplete="email"
                autoFocus
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>
            <Field label="Password">
              <Input
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
            {error ? (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-md bg-stone-100 p-3 text-sm text-stone-700 dark:bg-neutral-950 dark:text-stone-200">
                {message}
              </p>
            ) : null}
            <Button disabled={submitting} type="submit">
              {submitting ? "Signing in..." : "Login to dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
