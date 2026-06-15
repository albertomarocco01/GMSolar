import Container from "@gmgroup/ui/Container";
import Button from "@gmgroup/ui/Button";
import Badge from "@gmgroup/ui/Badge";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";

/**
 * Hero della sezione Shop (Cavo Perfetto). Pulito, tipografico, sull'accent
 * lime acido del brand. Niente video: lo shop punta su catalogo e assistente.
 */
export default function ShopHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Sfondo: accent soft + bagliore, coerente col theming shop. */}
      <div aria-hidden className="bg-accent-soft absolute inset-0 -z-20" />
      <div
        aria-hidden
        className="bg-accent/20 absolute -top-24 -right-16 -z-10 h-72 w-72 rounded-full blur-3xl"
      />

      <Container className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-3xl">
          <Badge>Cavo Perfetto · ricarica</Badge>
          <SplitTextReveal
            as="h1"
            text="Il cavo giusto, sempre."
            className="font-display text-display-sm sm:text-display-md md:text-display-lg mt-5 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-6 max-w-xl text-lg md:text-xl">
            Cavi di ricarica Mennekes per ogni auto e ogni colonnina. Non sai quale scegliere?
            L&apos;assistente trova il modello giusto in trenta secondi.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="#cable-finder" size="lg">
              Trova il tuo cavo
            </Button>
            <Button href="#catalogo" variant="outline" size="lg">
              Vai al catalogo
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
