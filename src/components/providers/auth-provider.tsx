"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { User } from "@supabase/supabase-js";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { getMissingSupabaseEnvMessage } from "@/lib/supabase-env";
import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";
import type { ProfileRole } from "@/types/commerce";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: ProfileRole;
};

type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authReady: boolean;
  requestLogin: (reason?: string) => boolean;
  testingLogin: (role?: ProfileRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  sendEmailOtp: (email: string) => Promise<{ error?: string; message?: string }>;
  verifyEmailOtp: (email: string, token: string) => Promise<{ error?: string; message?: string }>;
  signUp: (input: SignUpInput) => Promise<{ error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (profile: { fullName?: string; phone?: string; address?: string }) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  signOut: (redirectTo?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TESTING_USER_KEY = "rida-testing-user";
const AUTH_TIMEOUT_MS = 5000;

function withAuthTimeout<T>(promise: PromiseLike<T>, label: string) {
  let timeoutId: number;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out.`)), AUTH_TIMEOUT_MS);
  });

  return Promise.race([Promise.resolve(promise), timeout]).finally(() => window.clearTimeout(timeoutId));
}

function profileFromUser(user: User, role: ProfileRole = "customer"): AuthUser {
  return {
    id: user.id,
    email: user.email || "",
    name:
      typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name
        ? user.user_metadata.full_name
        : user.email?.split("@")[0] || "Customer",
    phone: typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : undefined,
    address: typeof user.user_metadata?.address === "string" ? user.user_metadata.address : undefined,
    role
  };
}

const ADMIN_ON_CUSTOMER_LOGIN_ERROR =
  "This is an admin account. Please use the Admin login at /dashboard/login.";

// Returns the role stored in the profiles table for a given user id.
// Used to keep customer and admin logins separate.
async function fetchProfileRole(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  userId?: string | null
): Promise<ProfileRole> {
  if (!userId) {
    return "customer";
  }

  const { data } = await withAuthTimeout(
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    "Role check"
  ).catch(() => ({ data: null }));

  return (data as { role?: string } | null)?.role === "admin" ? "admin" : "customer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const loadProfile = useCallback(async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    if (!hasSupabaseConfig()) {
      setUser(profileFromUser(supabaseUser));
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data } = await withAuthTimeout(
      supabase
        .from("profiles")
        .select("id, email, full_name, phone, address, role")
        .eq("id", supabaseUser.id)
        .maybeSingle(),
      "Profile load"
    ).catch(() => ({ data: null }));

    if (!data) {
      const fallback = profileFromUser(supabaseUser);
      await withAuthTimeout(
        supabase.from("profiles").upsert({
          id: fallback.id,
          email: fallback.email,
          full_name: fallback.name,
          phone: fallback.phone || null,
          role: "customer"
        }),
        "Profile create"
      ).catch(() => null);
      setUser(fallback);
      return;
    }

    setUser({
      id: supabaseUser.id,
      email: data.email || supabaseUser.email || "",
      name: data.full_name || supabaseUser.email?.split("@")[0] || "Customer",
      phone: data.phone || undefined,
      address: data.address || undefined,
      role: data.role === "admin" ? "admin" : "customer"
    });
  }, []);

  useEffect(() => {
    try {
      const testingUser = window.localStorage.getItem(TESTING_USER_KEY);
      if (testingUser) {
        setUser(JSON.parse(testingUser) as AuthUser);
        setAuthReady(true);
        return;
      }
    } catch {
      window.localStorage.removeItem(TESTING_USER_KEY);
    }

    if (!hasSupabaseConfig()) {
      setAuthReady(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let active = true;

    withAuthTimeout(supabase.auth.getUser(), "Auth check").then(({ data }) => {
      if (!active) {
        return;
      }
      void loadProfile(data.user).finally(() => setAuthReady(true));
    }).catch(() => {
      if (active) {
        setUser(null);
        setAuthReady(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadProfile(session?.user || null).finally(() => setAuthReady(true));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const requestLogin = useCallback(
    (reason = "Sign in to continue.") => {
      if (user) {
        return true;
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("rida-login-reason", reason);
      }

      router.push(`/login?next=${encodeURIComponent(pathname || "/account")}`);
      return false;
    },
    [pathname, router, user]
  );

  const refreshProfileInternal = useCallback(async () => {
    try {
      const testingUser = window.localStorage.getItem(TESTING_USER_KEY);
      if (testingUser) {
        setUser(JSON.parse(testingUser) as AuthUser);
        return;
      }
    } catch {
      window.localStorage.removeItem(TESTING_USER_KEY);
    }

    if (!hasSupabaseConfig()) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data } = await withAuthTimeout(supabase.auth.getUser(), "Profile refresh");
    await loadProfile(data.user);
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        window.localStorage.removeItem(TESTING_USER_KEY);
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          return { error: error.message };
        }

        const role = await fetchProfileRole(supabase, data.user?.id);
        if (role === "admin") {
          await supabase.auth.signOut().catch(() => null);
          setUser(null);
          return { error: ADMIN_ON_CUSTOMER_LOGIN_ERROR };
        }

        await refreshProfileInternal();
        return {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to sign in." };
      }
    },
    [refreshProfileInternal]
  );

  const sendEmailOtp = useCallback(async (email: string) => {
    try {
      window.localStorage.removeItem(TESTING_USER_KEY);

      const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/login`;
      const response = await withAuthTimeout(
        fetch("/api/auth/email-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send", email, redirectTo })
        }),
        "Email OTP"
      );

      const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;

      if (!response.ok) {
        return {
          error:
            payload?.error ||
            getMissingSupabaseEnvMessage() ||
            "Unable to send OTP. Check Supabase env on Vercel and enable Email auth in Supabase → Authentication → Providers."
        };
      }

      return { message: payload?.message || "OTP sent. Check your email." };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to send OTP." };
    }
  }, []);

  const verifyEmailOtp = useCallback(
    async (email: string, token: string) => {
      try {
        window.localStorage.removeItem(TESTING_USER_KEY);

        const response = await withAuthTimeout(
          fetch("/api/auth/email-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "verify", email, token: token.trim() })
          }),
          "OTP verify"
        );

        const payload = (await response.json().catch(() => null)) as
          | {
              error?: string;
              message?: string;
              session?: { accessToken: string; refreshToken: string; expiresAt?: number };
            }
          | null;

        if (!response.ok) {
          return {
            error:
              payload?.error ||
              getMissingSupabaseEnvMessage() ||
              "Unable to verify OTP. Check Supabase env on Vercel and enable Email auth in Supabase → Authentication → Providers."
          };
        }

        if (!payload?.session) {
          return { error: "OTP verified but no session was returned." };
        }

        if (!hasSupabaseConfig()) {
          return {
            error:
              getMissingSupabaseEnvMessage() ||
              "OTP verified but the browser session could not start. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY on Vercel, then redeploy."
          };
        }

        const supabase = getSupabaseBrowserClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: payload.session.accessToken,
          refresh_token: payload.session.refreshToken
        });

        if (sessionError) {
          return { error: sessionError.message };
        }

        await refreshProfileInternal();
        return { message: payload.message || "OTP verified." };
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to verify OTP." };
      }
    },
    [refreshProfileInternal]
  );

  const signUp = useCallback(async ({ email, fullName, password, phone }: SignUpInput) => {
    try {
      window.localStorage.removeItem(TESTING_USER_KEY);
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await withAuthTimeout(
          supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            phone: phone || null,
            role: "customer"
          }),
          "Profile signup"
        ).catch(() => null);
        await loadProfile(data.user);
      }

      return { message: "Account created. Check your email if confirmation is enabled in Supabase." };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to create account." };
    }
  }, [loadProfile]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        return { error: error.message };
      }

      return { message: "Password reset link sent to your email." };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unable to send password reset email." };
    }
  }, []);

  const testingLogin = useCallback(async (role: ProfileRole = "customer") => {
    const testingUser: AuthUser = {
      id: role === "admin" ? "testing-admin" : "testing-customer",
      email: role === "admin" ? "admin.testing@ridaboutique.local" : "customer.testing@ridaboutique.local",
      name: role === "admin" ? "Testing Admin" : "Rida Testing Customer",
      phone: role === "admin" ? "+91 70000 00001" : "+91 70000 00000",
      address: role === "admin" ? "Admin testing workspace" : "Lal Chowk, Srinagar, Jammu and Kashmir",
      role
    };

    if (hasSupabaseConfig()) {
      await withAuthTimeout(getSupabaseBrowserClient().auth.signOut(), "Testing sign out").catch(() => null);
    }

    window.localStorage.setItem(TESTING_USER_KEY, JSON.stringify(testingUser));
    setUser(testingUser);
    setAuthReady(true);
  }, []);

  const updateProfile = useCallback(
    async (profile: { fullName?: string; phone?: string; address?: string }) => {
      if (!user) {
        return { error: "Sign in before updating your profile." };
      }

      try {
        if (user.id.startsWith("testing-")) {
          const nextUser = {
            ...user,
            name: profile.fullName !== undefined ? profile.fullName : user.name,
            phone: profile.phone !== undefined ? profile.phone : user.phone,
            address: profile.address !== undefined ? profile.address : user.address
          };
          window.localStorage.setItem(TESTING_USER_KEY, JSON.stringify(nextUser));
          setUser(nextUser);
          return {};
        }

        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: profile.fullName !== undefined ? profile.fullName : user.name,
          phone: profile.phone !== undefined ? profile.phone || null : user.phone || null,
          address: profile.address !== undefined ? profile.address || null : user.address || null,
          role: user.role
        });

        if (error) {
          return { error: error.message };
        }

        await refreshProfileInternal();
        return {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to update profile." };
      }
    },
    [refreshProfileInternal, user]
  );

  const signOut = useCallback(async (redirectTo = "/") => {
    window.localStorage.removeItem(TESTING_USER_KEY);
    if (hasSupabaseConfig()) {
      await withAuthTimeout(getSupabaseBrowserClient().auth.signOut(), "Sign out").catch(() => null);
    }
    setUser(null);
    router.push(redirectTo);
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authReady,
      requestLogin,
      testingLogin,
      signIn,
      sendEmailOtp,
      verifyEmailOtp,
      signUp,
      resetPassword,
      updateProfile,
      refreshProfile: refreshProfileInternal,
      signOut
    }),
    [
      authReady,
      refreshProfileInternal,
      requestLogin,
      resetPassword,
      sendEmailOtp,
      signIn,
      signOut,
      signUp,
      testingLogin,
      updateProfile,
      user,
      verifyEmailOtp
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function LoginRequired({
  description = "Sign in with email and password to continue.",
  title = "Sign in to continue"
}: {
  description?: string;
  title?: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <Mail className="mx-auto size-9 text-neutral-950 dark:text-stone-100" />
      <h2 className="mt-4 text-2xl font-semibold text-neutral-950 dark:text-stone-100">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">{description}</p>
      <ButtonLink className="mt-6" href="/login">
        Sign In
      </ButtonLink>
    </div>
  );
}

export function AuthLoading({ title = "Checking your session" }: { title?: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto size-9 animate-pulse rounded-full bg-stone-200 dark:bg-neutral-800" />
      <h2 className="mt-4 text-2xl font-semibold text-neutral-950 dark:text-stone-100">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">
        Please wait while we confirm your email login.
      </p>
    </div>
  );
}

export function AdminOnlyMessage() {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <LockKeyhole className="mx-auto size-9" />
      <h2 className="mt-4 text-2xl font-semibold">Admin access required</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">
        Your account is signed in, but it is not marked as admin in the profiles table.
      </p>
      <ButtonLink className="mt-6" href="/account" variant="secondary">
        <UserRound className="size-4" />
        My Account
      </ButtonLink>
    </div>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
