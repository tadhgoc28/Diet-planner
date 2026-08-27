import { cn } from "@/lib/cn";

type TagKind = "cuisine" | "diet" | "meal" | "neutral";

const KIND_CLASSES: Record<TagKind, string> = {
  cuisine: "bg-terracotta-soft text-terracotta-dark",
  diet: "bg-sage-soft text-sage",
  meal: "bg-surface-muted text-ink-soft",
  neutral: "bg-surface-muted text-ink-soft",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        KIND_CLASSES[kind],
        className,
      )}
    >
      {children}
    </span>
  );
}
