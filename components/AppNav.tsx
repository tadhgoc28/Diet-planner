"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { apiSend } from "@/lib/api";

const LINKS = [
  { href: "/recipes", label: "Recipes" },
  { href: "/planner", label: "Planner" },
  { href: "/shopping-list", label: "Shopping list" },
];

export function AppNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await apiSend("/api/auth/logout", "POST");
      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const linkClass = (active: boolean) =>
    cn(
      "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-ink text-[color:var(--color-surface)]"
        : "text-ink-soft hover:bg-surface-muted hover:text-ink",
    );

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-6xl rounded-[var(--radius-card)] border border-line bg-[color:var(--color-surface)]/85 backdrop-blur">
        <div className="flex items-center gap-4 px-4 py-2.5">
          <Logo href="/recipes" />

          <nav className="ml-2 hidden gap-1 sm:flex">
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link key={link.href} href={link.href} className={linkClass(active)}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-ink-soft md:inline">
              {userName}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              loading={loggingOut}
            >
              Log out
            </Button>
          </div>
        </div>

        {/* Mobile nav row */}
        <nav className="flex gap-1 border-t border-line px-2 py-2 sm:hidden">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(linkClass(active), "flex-1 text-center")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
