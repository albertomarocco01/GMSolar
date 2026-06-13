import { cn } from "@/lib/utils";

export type CardProps = {
  /** Aggiunge hover "lift" + bordo accent: usa per card cliccabili. */
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">;

/** Superficie base: sfondo surface, bordo, radius e ombra coerenti. */
export default function Card({ interactive = false, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border-border shadow-card rounded-lg border",
        interactive &&
          "hover:border-accent/40 ease-out-expo hover:shadow-lift transition-[transform,box-shadow,border-color] duration-(--duration-base) hover:-translate-y-1",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
