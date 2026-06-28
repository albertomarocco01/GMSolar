"use client";

/**
 * @descrizione  Apertura della home scrollytelling (tema CHIARO): schermo intero,
 *   titolo d'impatto, sottotitolo che annuncia l'offerta, hint sull'auto-scroll.
 *   Sfondo luminoso con aloni accent animati (reduced-motion safe).
 * @indice
 * - HeroScene → prima sezione della pagina
 */
import Container from "@gmgroup/ui/Container";
import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";

export default function HeroScene() {
  return (
    <section className="bg-background text-foreground relative flex min-h-screen items-center overflow-hidden">
      {/* Sfondo: aloni accent tenui su chiaro */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-accent/20 absolute -top-32 -left-24 h-96 w-96 rounded-full blur-3xl motion-safe:animate-pulse" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-[#7c5cff]/15 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,var(--background)_100%)]" />
      </div>

      <Container className="relative">
        <p className="text-accent-ink text-sm font-semibold tracking-widest uppercase">
          La nostra offerta, in una scrollata
        </p>
        <SplitTextReveal
          as="h1"
          text="Tutto quello che possiamo costruire per te."
          className="font-display mt-4 max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-6xl md:text-7xl"
        />
        <p className="text-muted mt-6 max-w-xl text-lg">
          Siti vetrina cinematici, assistenti AI, dashboard di telemetria, gestionale, app di
          ricarica e integrazioni con qualunque sistema. Una presentazione interattiva, senza slide:
          scorre da sola.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="#vetrina" size="lg">
            Inizia il racconto
          </Button>
          <span className="text-muted flex items-center gap-2 text-sm">
            <span aria-hidden className="motion-safe:animate-bounce">
              ↓
            </span>
            scorre da solo · muovi il mouse per prendere il controllo
          </span>
        </div>
      </Container>
    </section>
  );
}
