import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";

/**
 * Blocco segnaposto riusabile per le pagine di sezione (stub). L'eyebrow usa
 * l'accent del mondo attivo: su /solar, /mobility, /shop il ThemeProvider
 * imposta già l'accent corretto, quindi qui non serve passare colori.
 */
export default function PagePlaceholder({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section className="pt-24">
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h1 className="font-display text-display-sm md:text-display-md mt-4 font-bold tracking-tight text-balance">
        {title}
      </h1>
      <div className="text-muted mt-6 max-w-2xl text-lg leading-relaxed">{children}</div>
    </Section>
  );
}
