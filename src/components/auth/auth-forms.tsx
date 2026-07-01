"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";

type AuthMode = "login" | "signup" | "reset";
type LoginMethod = "otp" | "password";

const WHATSAPP_SUPPORT_URL =
  "https://wa.me/917006011492?text=" +
  encodeURIComponent("Hi Rida Boutique, I need help with my account login.");

export function AuthForm({ mode, nextPath = "/account" }: { mode: AuthMode; nextPath?: string }) {
  const router = useRouter();
  const {
    isAuthenticated,
    resendEmailConfirmation,
    sendEmailOtp,
    signIn,
    signInWithGoogle,
    signUp,
    resetPassword,
    user,
    verifyEmailOtp
  } = useAuth();
  const next = nextPath;
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);
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

  async function handleGoogleSignIn() {
    setError("");
    setMessage("");
    setSubmitting(true);
    const result = await signInWithGoogle(mode === "signup" ? next : next);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  }

  async function handleResendVerification() {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setError("");
    setMessage("");
    setSubmitting(true);
    const result = await resendEmailConfirmation(email.trim());
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setAwaitingEmailConfirmation(true);
    setMessage(result.message || "Verification email sent.");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    let result: { error?: string; message?: string; needsEmailConfirmation?: boolean };

    if (mode === "login" && loginMethod === "otp") {
      result = otpSent ? await verifyEmailOtp(email, otp.trim()) : await sendEmailOtp(email);
    } else if (mode === "login") {
      result = await signIn(email, password);
    } else if (mode === "signup") {
      result = await signUp({ email, password, fullName, phone });
    } else {
      result = await resetPassword(email);
    }

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      if (result.needsEmailConfirmation) {
        setAwaitingEmailConfirmation(true);
      }
      return;
    }

    setMessage(result.message || "Success.");

    if (result.needsEmailConfirmation) {
      setAwaitingEmailConfirmation(true);
      return;
    }

    if (mode === "login" && loginMethod === "otp" && !otpSent) {
      setOtpSent(true);
      return;
    }

    if (mode === "login" || mode === "signup") {
      router.replace(next);
    }
  }

  const title = mode === "login" ? "Login" : mode === "signup" ? "Create account" : "Reset password";
  const description =
    mode === "login"
      ? "Sign in with Google, email OTP, or password."
      : mode === "signup"
        ? "Create an account with Google or email. We send a verification link automatically."
        : "Enter your account email to receive a password reset link.";
  const submitLabel =
    mode === "login" && loginMethod === "otp"
      ? otpSent
        ? "Verify OTP"
        : "Send OTP"
      : title;

  if (awaitingEmailConfirmation && (mode === "signup" || mode === "login")) {
    return (
      <section className="app-container pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
            We sent a verification link to <strong>{email}</strong>. Open it, then come back and login.
          </p>
          {message ? (
            <p className="mt-4 rounded-md bg-stone-100 p-3 text-sm text-stone-700 dark:bg-neutral-900 dark:text-stone-200">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">
              {error}
            </p>
          ) : null}
          <div className="mt-6 grid gap-3">
            <Button disabled={submitting} onClick={handleResendVerification} type="button">
              {submitting ? "Sending..." : "Resend verification email"}
            </Button>
            <Button onClick={() => router.push("/login")} type="button" variant="secondary">
              Go to login
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <div className="mx-auto max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p>

        {mode === "login" || mode === "signup" ? (
          <>
            <Button
              className="mt-6 w-full"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              type="button"
              variant="secondary"
            >
              Continue with Google
            </Button>
            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
              <span className="h-px flex-1 bg-stone-200 dark:bg-neutral-800" />
              or use email
              <span className="h-px flex-1 bg-stone-200 dark:bg-neutral-800" />
            </div>
          </>
        ) : null}

        {mode === "login" ? (
          <div className="grid grid-cols-2 rounded-full bg-brand-cream p-1 text-sm font-semibold text-brand-green">
            <button
              className={`rounded-full px-3 py-2 transition ${loginMethod === "otp" ? "bg-brand-green text-brand-ivory shadow-sm" : "hover:bg-white"}`}
              onClick={() => {
                setLoginMethod("otp");
                setError("");
                setMessage("");
              }}
              type="button"
            >
              Email OTP
            </button>
            <button
              className={`rounded-full px-3 py-2 transition ${loginMethod === "password" ? "bg-brand-green text-brand-ivory shadow-sm" : "hover:bg-white"}`}
              onClick={() => {
                setLoginMethod("password");
                setError("");
                setMessage("");
              }}
              type="button"
            >
              Password
            </button>
          </div>
        ) : null}

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
              onChange={(event) => {
                setEmail(event.target.value);
                setOtpSent(false);
                setOtp("");
              }}
              required
            />
          </Field>
          {mode === "login" && loginMethod === "otp" && otpSent ? (
            <Field label="Email OTP">
              <Input
                autoComplete="one-time-code"
                inputMode="numeric"
                minLength={4}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter code from email"
                required
              />
            </Field>
          ) : null}
          {mode !== "reset" && (mode !== "login" || loginMethod === "password") ? (
            <Field label="Password">
              <Input autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </Field>
          ) : null}
          {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}
          {message ? <p className="rounded-md bg-stone-100 p-3 text-sm text-stone-700 dark:bg-neutral-900 dark:text-stone-200">{message}</p> : null}
          {error && awaitingEmailConfirmation ? (
            <Button disabled={submitting} onClick={handleResendVerification} type="button" variant="secondary">
              Resend verification email
            </Button>
          ) : null}
          <Button disabled={submitting} type="submit">
            {submitting ? "Please wait..." : submitLabel}
          </Button>
          {mode === "login" && loginMethod === "otp" && otpSent ? (
            <button
              className="text-sm font-semibold text-brand-green hover:underline"
              disabled={submitting}
              onClick={async () => {
                setError("");
                setMessage("");
                setSubmitting(true);
                const result = await sendEmailOtp(email);
                setSubmitting(false);
                if (result.error) {
                  setError(result.error);
                } else {
                  setMessage(result.message || "OTP sent again.");
                }
              }}
              type="button"
            >
              Resend OTP
            </button>
          ) : null}
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
