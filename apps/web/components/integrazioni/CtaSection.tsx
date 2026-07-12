/**
 * @descrizione CTA di chiusura della pagina /integrazioni. Estratto da
 * app/integrazioni/page.tsx (stesso markup a runtime).
 */
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import Button from "@gmgroup/ui/Button";

export default function CtaSection() {
  return (
    <Section className="bg-surface-2">
      <ScrollReveal className="text-center">
        <h2 className="font-display text-display-sm font-bold tracking-tight">
          Quale sistema vuoi integrare?
        </h2>
        <p className="text-muted mx-auto mt-3 max-w-md text-base">
          Raccontaci i tuoi strumenti e il flusso che vorresti automatizzare: valutiamo insieme la
          soluzione più rapida.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" size="lg">
            ← Torna alla presentazione
          </Button>
          <Button href="/segnalazioni" size="lg" variant="outline">
            Mandaci una richiesta
          </Button>
        </div>
      </ScrollReveal>
    </Section>
  );
}
