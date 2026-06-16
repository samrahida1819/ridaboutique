"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") {
    return null;
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button
      aria-label="Go back"
      className="fixed left-6 top-[118px] z-40 hidden size-11 place-items-center rounded-full border border-brand-gold/35 bg-white/92 text-brand-green shadow-luxury backdrop-blur transition hover:bg-brand-gold hover:text-brand-green md:grid"
      onClick={goBack}
      type="button"
    >
      <ArrowLeft className="size-5" />
    </button>
  );
}
