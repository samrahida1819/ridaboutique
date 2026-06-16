"use client";

import { useEffect, useState } from "react";
import { LoginRequired, useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

export function AccountClient() {
  const { authReady, isAuthenticated, updateProfile, user } = useAuth();
  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(user.name || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
  }, [user]);

  if (!authReady) {
    return <div className="app-container pb-12 pt-32 md:pt-40">Loading account...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="app-container pb-12 pt-32 md:pt-40">
        <LoginRequired description="Sign in to manage your profile and order history." title="My Account" />
      </div>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const result = await updateProfile({ fullName, phone, address });
    setMessage(result.error || "Profile updated.");
    setSaving(false);
  }

  return (
    <section className="app-container pb-12 pt-32 md:pt-40">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="h-fit rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-stone-500">Signed in</p>
              <h1 className="mt-2 text-3xl font-semibold">{user.name}</h1>
            </div>
            {user.id.startsWith("testing-") ? (
              <span className="rounded-full border border-brand-gold/40 px-3 py-1 text-xs font-semibold text-brand-gold">
                Testing
              </span>
            ) : null}
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between border-b border-stone-200 pb-3 dark:border-neutral-800">
              <span className="text-stone-500">Email</span>
              <span className="text-right">{user.email}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-3 dark:border-neutral-800">
              <span className="text-stone-500">Phone</span>
              <span className="text-right">{user.phone || "-"}</span>
            </div>
            <div className="flex justify-between border-b border-stone-200 pb-3 dark:border-neutral-800">
              <span className="text-stone-500">Role</span>
              <span className="capitalize">{user.role}</span>
            </div>
            <div className="grid gap-1 border-b border-stone-200 pb-3 dark:border-neutral-800">
              <span className="text-stone-500">Default address</span>
              <span>{user.address || "Add an address from profile details."}</span>
            </div>
          </div>
        </aside>

        <form className="grid gap-5 rounded-lg border border-stone-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950" onSubmit={submit}>
          <h2 className="text-xl font-semibold">Profile details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
            </Field>
          </div>
          <Field label="Default address">
            <Textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Add your default delivery address" />
          </Field>
          {message ? <p className="text-sm text-stone-600 dark:text-stone-300">{message}</p> : null}
          <Button className="w-fit" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </div>
    </section>
  );
}
