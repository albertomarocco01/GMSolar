import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

/**
 * Blocco segnaposto riusabile per le pagine di sezione:
 * eyebrow (brand), titolo display e paragrafo placeholder.
 */
export default function PagePlaceholder({
  eyebrow,
  title,
  accentClassName = "text-brand-500",
  children,
}: {
  eyebrow?: string;
  title: string;
  accentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-24">
      {eyebrow ? (
        <p className={cn("mb-3 text-sm font-medium tracking-widest uppercase", accentClassName)}>
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-display-sm md:text-display-md font-bold tracking-tight text-balance">
        {title}
      </h1>
      <div className="text-muted mt-6 max-w-2xl text-lg leading-relaxed">{children}</div>
    </Container>
  );
}
