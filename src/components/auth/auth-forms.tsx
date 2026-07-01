"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, PasswordInput } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

type AuthMode = "login" | "signup" | "reset";

const WHATSAPP_SUPPORT_URL =
  "https://wa.me/917006011492?text=" +
  encodeURIComponent("Hi Rida Boutique, I need help with my account login.");

export function AuthForm({ mode, nextPath = "/account" }: { mode: AuthMode; nextPath?: string }) {
  const router = useRouter();
  const { isAuthenticated, signIn, signUp, resetPassword, user } = useAuth();
  const next = nextPath;
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || mode !== "login") {
      return;
    }

    if (user?.role === "admin") {
      router.replace("/dashboard");
      return;
    }

    router.replace(next);
  }, [isAuthenticated, mode, next, router, user]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    let result: { error?: string; message?: string };

    if (mode === "login") {
      result = await signIn(email, password);
    } else if (mode === "signup") {
      result = await signUp({ email, password, fullName, phone });
    } else {
      result = await resetPassword(email);
    }

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setMessage(result.message || "Success.");

    if (mode === "login" || mode === "signup") {
      router.replace(next);
    }
  }

  const title = mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Reset password";
  const description =
    mode === "login"
      ? "Sign in with email and password to access cart, wishlist, orders, and your profile."
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
            <Input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          {mode !== "reset" ? (
            <Field label="Password">
              <PasswordInput
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>
          ) : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          {message ? <p className="rounded-md bg-stone-100 p-3 text-sm text-stone-700 dark:bg-neutral-900 dark:text-stone-200">{message}</p> : null}
          <Button disabled={submitting} type="submit">
            {submitting ? "Please wait..." : title}
          </Button>
        </form>
        <div className="mt-5 grid gap-2 text-sm text-stone-600 dark:text-stone-300">
          {mode !== "login" ? <Link className="hover:underline" href="/login">Already have an account? Login</Link> : null}
          {mode !== "signup" ? <Link className="hover:underline" href="/signup">Create a new account</Link> : null}
          {mode !== "reset" ? <Link className="hover:underline" href="/reset-password">Forgot password?</Link> : null}
          {mode === "login" ? <Link className="hover:underline" href="/dashboard/login">Admin login</Link> : null}
          {mode === "login" || mode === "signup" ? (
            <a className="hover:underline" href={WHATSAPP_SUPPORT_URL} rel="noreferrer" target="_blank">
              Need help? Chat on WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
