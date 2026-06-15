"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [isReady, setIsReady] = useState(false);
  const [value, setValue] = useState(initialValue);

  function readStoredValue() {
    try {
      const storedValue = window.localStorage.getItem(key);

      if (storedValue) {
        setValue(JSON.parse(storedValue) as T);
      }
    } catch {
      setValue(initialValue);
    }
  }

  useEffect(() => {
    readStoredValue();
    setIsReady(true);
  }, [initialValue, key]);

  useEffect(() => {
    function handleAdminStorage(event: Event) {
      const customEvent = event as CustomEvent<{ key?: string }>;

      if (!customEvent.detail?.key || customEvent.detail.key === key) {
        readStoredValue();
      }
    }

    window.addEventListener("rida-admin-storage", handleAdminStorage);
    return () => window.removeEventListener("rida-admin-storage", handleAdminStorage);
  }, [initialValue, key]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(value));
  }, [isReady, key, value]);

  return [value, setValue];
}
