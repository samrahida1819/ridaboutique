"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ToastKind = "success" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  kind: ToastKind;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id" | "kind"> & { kind?: ToastKind }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (nextToast: Omit<Toast, "id" | "kind"> & { kind?: ToastKind }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [
        ...current,
        {
          id,
          kind: nextToast.kind || "success",
          title: nextToast.title,
          description: nextToast.description
        }
      ]);
      window.setTimeout(() => removeToast(id), 3600);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[90] flex w-[min(92vw,380px)] flex-col gap-3">
        {toasts.map((item) => {
          const Icon = item.kind === "success" ? CheckCircle2 : Info;
          return (
            <div
              className="rounded-lg border border-stone-200 bg-white p-4 text-neutral-950 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 dark:text-stone-100"
              key={item.id}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-5 text-stone-600 dark:text-stone-300">{item.description}</p>
                  ) : null}
                </div>
                <Button aria-label="Dismiss notification" onClick={() => removeToast(item.id)} size="icon" variant="ghost">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
