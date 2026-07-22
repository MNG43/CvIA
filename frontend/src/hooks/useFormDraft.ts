import { useEffect, useRef, useState } from "react";

/**
 * Persists form state to localStorage so data survives navigation
 * away and back. Pass a unique `key` per form and the initial values.
 *
 * Usage:
 *   const [form, setForm] = useFormDraft("login_form", { email: "", password: "" });
 */
export function useFormDraft<T extends object>(
  key: string,
  initial: T
): [T, (v: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return { ...initial, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return initial;
  });

  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state]);

  const clear = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setState(initial);
  };

  return [state, setState, clear];
}
