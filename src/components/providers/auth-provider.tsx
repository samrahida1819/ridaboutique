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
  signUp: (input: SignUpInput) => Promise<{ error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (profile: { fullName?: string; phone?: string; address?: string }) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TESTING_USER_KEY = "rida-testing-user";

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
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, address, role")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    if (!data) {
      const fallback = profileFromUser(supabaseUser);
      await supabase.from("profiles").upsert({
        id: fallback.id,
        email: fallback.email,
        full_name: fallback.name,
        phone: fallback.phone || null,
        role: "customer"
      });
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

    supabase.auth.getUser().then(({ data }) => {
      if (!active) {
        return;
      }
      void loadProfile(data.user).finally(() => setAuthReady(true));
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
    const { data } = await supabase.auth.getUser();
    await loadProfile(data.user);
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        window.localStorage.removeItem(TESTING_USER_KEY);
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          return { error: error.message };
        }

        await refreshProfileInternal();
        return {};
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Unable to sign in." };
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
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone: phone || null,
          role: "customer"
        });
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
      await getSupabaseBrowserClient().auth.signOut();
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
            name: profile.fullName || user.name,
            phone: profile.phone || user.phone,
            address: profile.address || user.address
          };
          window.localStorage.setItem(TESTING_USER_KEY, JSON.stringify(nextUser));
          setUser(nextUser);
          return {};
        }

        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          full_name: profile.fullName || user.name,
          phone: profile.phone || user.phone || null,
          address: profile.address || null,
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

  const signOut = useCallback(async () => {
    window.localStorage.removeItem(TESTING_USER_KEY);
    if (hasSupabaseConfig()) {
      await getSupabaseBrowserClient().auth.signOut();
    }
    setUser(null);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authReady,
      requestLogin,
      testingLogin,
      signIn,
      signUp,
      resetPassword,
      updateProfile,
      refreshProfile: refreshProfileInternal,
      signOut
    }),
    [authReady, refreshProfileInternal, requestLogin, resetPassword, signIn, signOut, signUp, testingLogin, updateProfile, user]
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
