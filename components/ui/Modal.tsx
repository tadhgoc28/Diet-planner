"use client";

import { useEffect } from "react";
import { Card } from "./Card";

/** Minimal centered modal with backdrop, Escape-to-close and scroll lock. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <Card
        className="w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg text-ink">{title}</h2>
        {children && <div className="mt-2 text-sm text-ink-soft">{children}</div>}
        {footer && (
          <div className="mt-6 flex justify-end gap-3">{footer}</div>
        )}
      </Card>
    </div>
  );
}
