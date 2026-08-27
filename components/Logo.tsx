import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-display text-xl font-semibold text-ink",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-lg bg-terracotta text-sm text-white"
      >
        M
      </span>
      MealBoard
    </Link>
  );
}
