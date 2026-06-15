"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { LockKeyhole, MessageCircle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

type AuthUser = {
  id: string;
  name: string;
  phone: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authReady: boolean;
  requestLogin: (reason?: string) => boolean;
  signOut: () => Promise<void>;
};

type AuthStep = "phone" | "otp";

const countryCodes = [
  { label: "India", value: "+91" },
  { label: "Pakistan", value: "+92" },
  { label: "UAE", value: "+971" },
  { label: "Saudi Arabia", value: "+966" },
  { label: "United States", value: "+1" },
  { label: "United Kingdom", value: "+44" }
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginReason, setLoginReason] = useState("Sign in to continue.");
  const [step, setStep] = useState<AuthStep>("phone");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json()) as { user: AuthUser | null };

        if (active) {
          setUser(data.user);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  function requestLogin(reason = "Sign in to continue.") {
    if (user) {
      return true;
    }

    setLoginReason(reason);
    setLoginOpen(true);
    return false;
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  async function testingLogin() {
    setSubmitting(true);
    setError("");
    setNameError("");
    setPhoneError("");
    setNotice("");

    try {
      const response = await fetch("/api/auth/testing-login", { method: "POST" });
      const data = (await response.json()) as { error?: string; user?: AuthUser };

      if (!response.ok || !data.user) {
        setError(data.error || "Unable to start testing login.");
        return;
      }

      setUser(data.user);
      setLoginOpen(false);
      setStep("phone");
      setOtp("");
    } catch {
      setError("Unable to start testing login.");
    } finally {
      setSubmitting(false);
    }
  }

  function getPhoneWithCountryCode() {
    return `${countryCode}${phone.replace(/\D/g, "")}`;
  }

  async function sendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNameError("");
    setPhoneError("");
    setNotice("");

    let blocked = false;
    const trimmedName = name.trim();
    const phoneDigits = phone.replace(/\D/g, "");

    if (!trimmedName) {
      setNameError("Name is required.");
      blocked = true;
    }

    if (!phoneDigits) {
      setPhoneError("Enter your WhatsApp phone number.");
      blocked = true;
    } else if (countryCode === "+91" && phoneDigits.length !== 10) {
      setPhoneError("Enter a 10 digit Indian WhatsApp number.");
      blocked = true;
    } else if (phoneDigits.length < 7 || phoneDigits.length > 12) {
      setPhoneError("Enter a valid WhatsApp number.");
      blocked = true;
    }

    if (blocked) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/whatsapp/send-otp", {
        body: JSON.stringify({ phone: getPhoneWithCountryCode() }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = (await response.json()) as { devMode?: boolean; error?: string; phone?: string };

      if (!response.ok) {
        setError(data.error || "Unable to send WhatsApp OTP.");
        return;
      }

      setVerifiedPhone(data.phone || phone);
      setStep("otp");
      setNotice(
        data.devMode
          ? "Development mode: OTP printed in server logs."
          : "OTP sent on WhatsApp. It expires in 5 minutes."
      );
    } catch {
      setError("Unable to send WhatsApp OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNameError("");
    setNotice("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Name is required.");
      setStep("phone");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError("Enter the 6 digit OTP.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/whatsapp/verify-otp", {
        body: JSON.stringify({ name: trimmedName, otp, phone: verifiedPhone || getPhoneWithCountryCode() }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = (await response.json()) as { error?: string; user?: AuthUser };

      if (!response.ok || !data.user) {
        setError(data.error || "Unable to verify OTP.");
        return;
      }

      setUser(data.user);
      setLoginOpen(false);
      setStep("phone");
      setOtp("");
      setNotice("");
    } catch {
      setError("Unable to verify OTP.");
    } finally {
      setSubmitting(false);
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authReady,
      requestLogin,
      signOut
    }),
    [authReady, user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Modal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        title={step === "phone" ? "WhatsApp login" : "Verify WhatsApp OTP"}
      >
        <div className="rounded-2xl bg-brand-cream p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-green">
            <LockKeyhole className="size-4 text-brand-gold" />
            {loginReason}
          </p>
          <p className="mt-2 text-sm leading-6 text-brand-charcoal/62">
            We use WhatsApp OTP for login. No password is saved in the app.
          </p>
        </div>

        {step === "phone" ? (
          <form className="mt-5 grid gap-4" onSubmit={sendOtp}>
            <Field error={nameError} label="Name">
              <Input
                autoFocus
                required
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError("");
                }}
                placeholder="Your full name"
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
              <Field label="Country Code">
                <Select value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
                  {countryCodes.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label} ({country.value})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field error={phoneError || error} label="WhatsApp Number">
                <Input
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value.replace(/\D/g, "").slice(0, 12));
                    setError("");
                    setPhoneError("");
                  }}
                  placeholder="70000 00000"
                />
              </Field>
            </div>
            <Button className="w-full" disabled={submitting} type="submit">
              <MessageCircle className="size-4" />
              {submitting ? "Sending OTP..." : "Send WhatsApp OTP"}
            </Button>
            <div className="rounded-2xl border border-brand-green/10 bg-white p-4">
              <p className="text-sm font-semibold text-brand-green">Testing login</p>
              <p className="mt-1 text-xs leading-5 text-brand-charcoal/55">
                Use this while WhatsApp OTP and database setup are paused.
              </p>
              <Button
                className="mt-3 w-full"
                disabled={submitting}
                onClick={() => void testingLogin()}
                type="button"
                variant="secondary"
              >
                <UserRound className="size-4" />
                {submitting ? "Opening Testing Account..." : "Continue With Testing Account"}
              </Button>
            </div>
          </form>
        ) : (
          <form className="mt-5 grid gap-4" onSubmit={verifyOtp}>
            <div className="rounded-2xl border border-brand-green/10 bg-white p-4 text-sm leading-6 text-brand-charcoal/62">
              OTP sent to <span className="font-semibold text-brand-green">{verifiedPhone}</span>
            </div>
            <Field error={error} label="6 Digit OTP">
              <Input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                placeholder="123456"
              />
            </Field>
            {notice ? (
              <p className="rounded-2xl bg-brand-cream p-4 text-sm font-semibold text-brand-green">
                {notice}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button disabled={submitting} type="submit">
                <UserRound className="size-4" />
                {submitting ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                disabled={submitting}
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                  setNotice("");
                }}
                type="button"
                variant="secondary"
              >
                Change Number
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </AuthContext.Provider>
  );
}

export function LoginRequired({
  description = "Sign in to access this account feature.",
  title = "Sign in to continue"
}: {
  description?: string;
  title?: string;
}) {
  const { requestLogin } = useAuth();

  return (
    <div className="rounded-2xl border border-brand-green/10 bg-white p-8 text-center shadow-luxury sm:rounded-[1.75rem] sm:p-12">
      <MessageCircle className="mx-auto size-10 text-brand-gold" />
      <h2 className="mt-5 font-serif text-3xl text-brand-green sm:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-charcoal/60">
        {description}
      </p>
      <Button className="mt-8" onClick={() => requestLogin(description)}>
        Sign In With WhatsApp
      </Button>
    </div>
  );
}

export function AuthLoading({ title = "Checking your session" }: { title?: string }) {
  return (
    <div className="rounded-2xl border border-brand-green/10 bg-white p-8 text-center shadow-luxury sm:rounded-[1.75rem] sm:p-12">
      <div className="mx-auto size-10 animate-pulse rounded-full bg-brand-gold/35" />
      <h2 className="mt-5 font-serif text-3xl text-brand-green sm:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-charcoal/60">
        Please wait while we confirm your WhatsApp login.
      </p>
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
