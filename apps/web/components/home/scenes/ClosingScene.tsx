"use client";

/**
 * @descrizione  Chiusura della home (tema CHIARO): invito al contatto.
 *   "Ricomincia" riporta in cima dopo l'auto-scroll.
 * @indice
 * - ClosingScene → ultima sezione della pagina
 */
import Container from "@gmgroup/ui/Container";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { GROUP } from "@gmgroup/lib/site";

export default function ClosingScene() {
  return (
    <section className="bg-surface text-foreground flex min-h-screen items-center text-center">
      <Container>
        <p className="text-accent-ink text-sm font-semibold tracking-widest uppercase">
          Il prossimo passo
        </p>
        <SplitTextReveal
          as="h2"
          text="Parliamo del tuo progetto."
          className="font-display mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl"
        />
        <p className="text-muted mx-auto mt-6 max-w-xl text-lg">
          Hai visto cosa sappiamo costruire. Raccontaci cosa ti serve: ti rispondiamo con una
          proposta su misura.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href={`mailto:${GROUP.email}`} size="lg">
            Parla con noi
          </Button>
          <Button href="#top" variant="outline" size="lg">
            ↑ Rivedi dall&apos;inizio
          </Button>
        </div>
      </Container>
    </section>
  );
}
