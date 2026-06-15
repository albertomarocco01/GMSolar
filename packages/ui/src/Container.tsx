import { cn } from "@gmgroup/lib/utils";

/** Larghezze massime semantiche per il contenuto. */
const SIZES = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
} as const;

export type ContainerProps = {
  size?: keyof typeof SIZES;
  className?: string;
  children: React.ReactNode;
};

/** Wrapper di larghezza massima con gutter orizzontale coerente (px-gutter). */
export default function Container({ size = "default", className, children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-6 md:px-8", SIZES[size], className)}>{children}</div>
  );
}
