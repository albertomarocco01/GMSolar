"use client";

/**
 * @descrizione  Chiusura della home: invito al contatto. Bookend scuro coerente
 *   con l'hero. "Ricomincia" riporta dolcemente in cima (utile dopo l'auto-scroll).
 * @indice
 * - ClosingScene → ultima sezione della pagina
 */
import Container from "@gmgroup/ui/Container";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { GROUP } from "@gmgroup/lib/site";

export default function ClosingScene() {
  return (
    <section className="flex min-h-screen items-center bg-[#070809] text-center text-white">
      <Container>
        <p className="text-accent text-sm font-semibold tracking-widest uppercase">
          Il prossimo passo
        </p>
        <SplitTextReveal
          as="h2"
          text="Parliamo del tuo progetto."
          className="font-display mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl"
        />
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
          Hai visto cosa sappiamo costruire. Raccontaci cosa ti serve: ti rispondiamo con una
          proposta su misura.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href={`mailto:${GROUP.email}`} size="lg">
            Parla con noi
          </Button>
          <Button
            href="#top"
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10"
          >
            ↑ Rivedi dall&apos;inizio
          </Button>
        </div>
      </Container>
    </section>
  );
}
