import type { Metadata } from "next";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import ShopHero from "@/components/shop/ShopHero";
import CableFinder from "@/components/shop/CableFinder";
import Catalog from "@/components/shop/Catalog";
import { resolveProvider } from "@/app/api/cable-finder/providers";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

const products = productsData as unknown as Product[];

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Cavo Perfetto — e-commerce di cavi di ricarica Mennekes (Tipo 2 / Schuko, mono e trifase) con assistente AI per trovare il cavo giusto.",
};

export default function ShopPage() {
  // Decisione lato server: se manca la chiave, la chat degrada al wizard.
  // Passiamo solo un boolean al client — nessun segreto attraversa il confine.
  const aiEnabled = resolveProvider() !== null;

  return (
    <>
      <ShopHero />

      <CableFinder aiEnabled={aiEnabled} />

      {/* Catalogo */}
      <Section id="catalogo">
        <div className="max-w-2xl">
          <Badge>Catalogo</Badge>
          <SplitTextReveal
            as="h2"
            text="Tutti i cavi Cavo Perfetto"
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
