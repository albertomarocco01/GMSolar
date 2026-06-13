import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition-[background-color,color,box-shadow,transform] duration-(--duration-fast) ease-out-expo " +
  "disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

const VARIANTS: Record<Variant, string> = {
  // Accent pieno: il colore segue il "mondo" attivo (--accent).
  solid: "bg-accent text-accent-contrast hover:bg-accent-strong hover:shadow-lift",
  outline: "border border-accent text-accent-ink hover:bg-accent-soft",
  ghost: "text-foreground hover:bg-surface-2",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

/** Se è presente `href` renderizza un Link Next, altrimenti un <button>. */
type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  // Una sola destrutturazione: variant/size/className/children sono "consumati",
  // il resto (`rest`) sono prop DOM da inoltrare a <button>/<Link>.
  const { variant = "solid", size = "md", className, children, ...rest } = props;
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], className);

  if (props.href !== undefined) {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
