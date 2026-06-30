"use client";

import { getSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase";

type AdminFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | Array<Record<string, unknown>>;
};

export async function adminFetch<T>(url: string, options: AdminFetchOptions = {}) {
  const { body, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  const bodyIsJson =
    body !== undefined &&
    typeof body !== "string" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer);

  if (bodyIsJson && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (hasSupabaseConfig()) {
    const { data } = await getSupabaseBrowserClient().auth.getSession();
    const token = data.session?.access_token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...requestOptions,
    body: bodyIsJson ? JSON.stringify(body) : body,
    cache: "no-store",
    headers
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error || "Admin request failed.");
  }

  return payload;
}
