"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

const controlClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-soft/60 shadow-sm transition-colors focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta-soft aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger-soft";

type FieldWrapProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
};

/** Label + control + inline error, wired up with matching ids for a11y. */
export function Field({
  label,
  error,
  hint,
  required,
  children,
}: FieldWrapProps) {
  const id = useId();
  const describedBy = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlClass, "min-h-24 resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClass, "pr-8", className)} {...props} />;
}
