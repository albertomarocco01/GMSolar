import { cn } from "@/lib/utils";

type Variant = "accent" | "neutral" | "outline";

const VARIANTS: Record<Variant, string> = {
  // Accent "soft": tinta dell'accent attivo; testo in accent-ink (leggibile
  // sia su chiaro che su scuro).
  accent: "bg-accent-soft text-accent-ink",
  neutral: "bg-surface-2 text-muted",
  outline: "border-border text-muted border",
};

export type BadgeProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

/** Etichetta pill piccola: eyebrow, stato, categoria. */
export default function Badge({ variant = "accent", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
