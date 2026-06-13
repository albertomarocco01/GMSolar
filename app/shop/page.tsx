import type { Metadata } from "next";
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Shop",
  description: "Cavo Perfetto — e-commerce cavi di ricarica.",
};

export default function ShopPage() {
  return (
    <PagePlaceholder eyebrow="Cavo Perfetto" title="Shop ricarica">
      <p>
        Segnaposto della sezione Shop (e-commerce cavi di ricarica). Qui arriveranno il catalogo
        prodotti e l&apos;assistente AI &laquo;trova il cavo per la tua auto&raquo;.
      </p>
    </PagePlaceholder>
  );
}
