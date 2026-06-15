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
import { AnimatePresence, motion } from "framer-motion";
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
        <AnimatePresence>
          {toasts.map((item) => {
            const Icon = item.kind === "success" ? CheckCircle2 : Info;
            return (
              <motion.div
                animate={{ opacity: 1, x: 0, y: 0 }}
                className="rounded-2xl border border-brand-gold/30 bg-brand-green p-4 text-brand-ivory shadow-luxury"
                exit={{ opacity: 0, x: 24 }}
                initial={{ opacity: 0, x: 24, y: 8 }}
                key={item.id}
                layout
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-5 text-brand-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-xs leading-5 text-brand-ivory/70">{item.description}</p>
                    ) : null}
                  </div>
                  <Button
                    aria-label="Dismiss notification"
                    className="text-brand-ivory hover:bg-white/10"
                    onClick={() => removeToast(item.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
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
