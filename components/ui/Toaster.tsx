"use client";

import { useEffect, useState } from "react";

/**
 * Dead-simple toast system: `toast("message")` from anywhere on the client,
 * `<Toaster />` mounted once in the app layout renders them.
 */
type Toast = { id: number; message: string; kind: "error" | "success" };

let listeners: ((t: Toast) => void)[] = [];
let nextId = 1;

export function toast(message: string, kind: Toast["kind"] = "error") {
  const t = { id: nextId++, message, kind };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4500);
    };
    listeners.push(onToast);
    return () => {
      listeners = listeners.filter((l) => l !== onToast);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto max-w-sm rounded-xl px-4 py-2.5 text-sm font-medium shadow-[var(--shadow-card)] ${
            t.kind === "error"
              ? "bg-danger text-white"
              : "bg-sage text-white"
          }`}
          role="status"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
