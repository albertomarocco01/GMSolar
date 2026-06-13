import { cn } from "@/lib/utils";

/** Wrapper di larghezza massima con gutter orizzontale coerente. */
export default function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-6 md:px-8", className)}>{children}</div>;
}
