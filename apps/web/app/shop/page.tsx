import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import ShopHero from "@/components/shop/ShopHero";
import CableFinder from "@/components/shop/CableFinder";
import ShopTrust from "@/components/shop/ShopTrust";
import Catalog from "@/components/shop/Catalog";
import { resolveProvider } from "@/app/api/cable-finder/providers";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

const products = productsData as unknown as Product[];

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Cavo Perfetto — e-commerce di cavi di ricarica Mennekes (Tipo 2 / Schuko, mono e trifase) con assistente AI per trovare il cavo giusto.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  // Decisione lato server: se manca la chiave, la chat degrada al wizard.
  // Passiamo solo un boolean al client — nessun segreto attraversa il confine.
  const aiEnabled = resolveProvider() !== null;

  return (
    <>
      <ShopHero />

      {/* Cable Advisor — gestito da una chat parallela: non modificare. */}
      <CableFinder aiEnabled={aiEnabled} />

      {/* Promesse del brand, una sola volta in pagina. */}
      <ShopTrust />

      {/* Catalogo */}
      <Section id="catalogo">
        <div className="max-w-2xl">
          <p className="text-accent-ink flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase">
            <span className="bg-accent-ink/50 h-px w-5" aria-hidden />
            02 — Catalogo
          </p>
          <SplitTextReveal
            as="h2"
            text="Il catalogo completo"
            className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance"
          />
          <p className="text-muted mt-4 text-lg">
            Cavi Mennekes per stazioni pubbliche, wallbox di casa e prese domestiche. Filtra per
            categoria, fase e forma.
          </p>
        </div>

        <div className="mt-10">
          <Catalog products={products} />
        </div>
      </Section>
    </>
  );
}
