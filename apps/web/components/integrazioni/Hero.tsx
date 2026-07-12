/**
 * @descrizione Hero della pagina /integrazioni: titolo, sottotitolo e
 * disclaimer "simulazione dimostrativa". Estratto da app/integrazioni/page.tsx
 * per tenere il file della route sotto le 300 righe (stesso markup a runtime).
 */
import { Info } from "lucide-react";
import Section from "@gmgroup/ui/Section";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import Badge from "@gmgroup/ui/Badge";
import Button from "@gmgroup/ui/Button";

export default function Hero() {
  return (
    <Section className="pt-20 pb-10">
      <ScrollReveal>
        <Badge>Servizio 06 · Integrazioni API</Badge>

        <h1 className="font-display text-display-sm md:text-display-md mt-4 max-w-3xl font-bold tracking-tight text-balance">
          Ci integriamo con molti sistemi, su richiesta
        </h1>

        <p className="text-muted mt-4 max-w-xl text-lg leading-relaxed">
          WhatsApp, email transazionali, CRM, pagamenti e AI: progettiamo e implementiamo flussi
          automatici che orchestrano qualunque sistema con API, senza silos.
        </p>

        {/* Disclaimer simulazione */}
        <p className="text-muted border-border mt-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs">
          <Info size={12} aria-hidden />
          Simulazione dimostrativa — nessuna chiamata reale viene effettuata in questa pagina
        </p>

        <div className="mt-8">
          <Button href="/" variant="outline">
            ← Torna alla presentazione
          </Button>
        </div>
      </ScrollReveal>
    </Section>
  );
}
