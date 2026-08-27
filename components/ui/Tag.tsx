import { cn } from "@/lib/cn";

type TagKind = "cuisine" | "diet" | "meal" | "neutral";

const KIND_CLASSES: Record<TagKind, string> = {
  cuisine: "bg-terracotta-soft text-terracotta-dark border-terracotta/20",
  diet: "bg-sage-soft text-sage border-sage/20",
  meal: "bg-[color:var(--color-butter-soft)] text-[color:var(--color-butter)] border-[color:var(--color-butter)]/25",
  neutral: "bg-surface-muted text-ink-soft border-line",
};

export function Tag({
  children,
  kind = "neutral",
  className,
}: {
  children: React.ReactNode;
  kind?: TagKind;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        KIND_CLASSES[kind],
        className,
      )}
    >
      {children}
    </span>
  );
}
