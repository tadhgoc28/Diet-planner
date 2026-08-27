"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { apiSend, ApiError } from "@/lib/api";
import { loginSchema, signupSchema } from "@/lib/validation";

type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; cta: string; alt: string; altHref: string; altLabel: string }> = {
  login: {
    title: "Welcome back",
    cta: "Log in",
    alt: "New to MealBoard?",
    altHref: "/signup",
    altLabel: "Create an account",
  },
  signup: {
    title: "Create your board",
    cta: "Sign up",
    alt: "Already have an account?",
    altHref: "/login",
    altLabel: "Log in",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/recipes";
  const copy = COPY[mode];

  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(key: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [key]: e.target.value }));
      setErrors((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      });
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const schema = mode === "signup" ? signupSchema : loginSchema;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "_");
        if (!flat[k]) flat[k] = issue.message;
      }
      setErrors(flat);
      return;
    }

    setSubmitting(true);
    try {
      await apiSend(`/api/auth/${mode}`, "POST", parsed.data);
      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) setErrors(err.fieldErrors);
        if (!err.fieldErrors) setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl text-ink">{copy.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {copy.alt}{" "}
        <Link href={copy.altHref} className="font-medium text-terracotta-dark underline">
          {copy.altLabel}
        </Link>
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {mode === "signup" && (
          <Field label="Name" error={errors.name} required>
            {(p) => (
              <Input
                {...p}
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={update("name")}
                placeholder="Sam Cook"
              />
            )}
          </Field>
        )}

        <Field label="Email" error={errors.email} required>
          {(p) => (
            <Input
              {...p}
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update("email")}
              placeholder="you@example.com"
            />
          )}
        </Field>

        <Field
          label="Password"
          error={errors.password}
          hint={mode === "signup" ? "At least 8 characters" : undefined}
          required
        >
          {(p) => (
            <Input
              {...p}
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={values.password}
              onChange={update("password")}
              placeholder="••••••••"
            />
          )}
        </Field>

        {formError && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" loading={submitting} className="w-full">
          {copy.cta}
        </Button>
      </form>
    </Card>
  );
}
