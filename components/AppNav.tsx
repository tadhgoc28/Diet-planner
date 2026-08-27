"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mutate } from "swr";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { resetToSamples } from "@/lib/localdb";

const LINKS = [
  { href: "/recipes", label: "Recipes" },
  { href: "/planner", label: "Planner" },
  { href: "/shopping-list", label: "Shopping list" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [resetOpen, setResetOpen] = useState(false);

  const linkClass = (active: boolean) =>
    cn(
      "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-ink text-[color:var(--color-surface)]"
        : "text-ink-soft hover:bg-surface-muted hover:text-ink",
    );

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function reset() {
    resetToSamples();
    // Drop every SWR cache entry and refetch so all views re-read storage.
    mutate(() => true, undefined, { revalidate: true });
    setResetOpen(false);
    router.push("/recipes");
  }

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
      <div className="mx-auto max-w-6xl rounded-[var(--radius-card)] border border-line bg-[color:var(--color-surface)]/85 backdrop-blur">
        <div className="flex items-center gap-4 px-4 py-2.5">
          <Logo href="/recipes" />

          <nav className="ml-2 hidden gap-1 sm:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(isActive(link.href))}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetOpen(true)}
            >
              Reset data
            </Button>
          </div>
        </div>

        {/* Mobile nav row */}
        <nav className="flex gap-1 border-t border-line px-2 py-2 sm:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(linkClass(isActive(link.href)), "flex-1 text-center")}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset to sample data?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={reset}>
              Reset everything
            </Button>
          </>
        }
      >
        <p>
          This replaces everything stored in this browser — your recipes, planner
          and shopping list — with the six sample recipes. It can’t be undone.
        </p>
      </Modal>
    </header>
  );
}
