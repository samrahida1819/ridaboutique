"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

type AuthMode = "login" | "signup" | "reset";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, signIn, signUp, resetPassword, testingLogin } = useAuth();
  const next = searchParams.get("next") || "/account";
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && mode === "login") {
      router.replace(next);
    }
  }, [isAuthenticated, mode, next, router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    const result: { error?: string; message?: string } =
      mode === "login"
        ? await signIn(email, password)
        : mode === "signup"
          ? await signUp({ email, password, fullName, phone })
          : await resetPassword(email);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(result.message || "Success.");

    if (mode === "login") {
      router.replace(next);
    }
    if (mode === "signup") {
      router.replace("/account");
    }
  }

  async function continueWithTestingCustomer() {
    await testingLogin("customer");
    router.replace(next);
  }

  const title = mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Reset password";
  const description =
    mode === "login"
      ? "Use your email and password to access cart, wishlist, checkout, and orders."
      : mode === "signup"
        ? "Create a customer account with email and password."
        : "Enter your account email to receive a password reset link.";

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <div className="mx-auto max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          {mode === "signup" ? (
            <>
              <Field label="Full name">
                <Input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </Field>
              <Field label="Phone">
                <Input autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </Field>
            </>
          ) : null}
          <Field label="Email">
            <Input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
          {mode !== "reset" ? (
            <Field label="Password">
              <Input autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </Field>
          ) : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          {message ? <p className="rounded-md bg-stone-100 p-3 text-sm text-stone-700 dark:bg-neutral-900 dark:text-stone-200">{message}</p> : null}
          <Button disabled={submitting} type="submit">
            {submitting ? "Please wait..." : title}
          </Button>
        </form>
        {mode === "login" ? (
          <div className="mt-4 rounded-2xl border border-brand-green/10 bg-brand-cream p-4">
            <p className="text-sm font-semibold text-brand-green">Testing login</p>
            <p className="mt-1 text-xs leading-5 text-brand-charcoal/60">
              Opens a local customer session with demo profile details, so account, wishlist, cart, and checkout can be tested.
            </p>
            <Button className="mt-3 w-full" onClick={() => void continueWithTestingCustomer()} variant="secondary">
              Continue with testing customer
            </Button>
          </div>
        ) : null}
        <div className="mt-5 grid gap-2 text-sm text-stone-600 dark:text-stone-300">
          {mode !== "login" ? <Link className="hover:underline" href="/login">Already have an account? Login</Link> : null}
          {mode !== "signup" ? <Link className="hover:underline" href="/signup">Create a new account</Link> : null}
          {mode !== "reset" ? <Link className="hover:underline" href="/reset-password">Forgot password?</Link> : null}
        </div>
      </div>
    </section>
  );
}
