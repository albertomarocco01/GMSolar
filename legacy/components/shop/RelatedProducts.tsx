import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import ProductCard from "./ProductCard";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

const products = productsData as unknown as Product[];

/**
 * "Cavi correlati" della PDP — calcolati a build-time (la pagina resta SSG):
 * stessa categoria, poi stesso Modo, infine altri, fino a 3, escluso il corrente.
 * L'indice "N°" è la posizione STABILE nel catalogo completo.
 */
function relatedTo(current: Product): Product[] {
  const others = products.filter((p) => p.id !== current.id);
  const sameCategory = others.filter((p) => p.category === current.category);
  const sameMode = others.filter(
    (p) => p.category !== current.category && p.specs.mode === current.specs.mode,
  );
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of [...sameCategory, ...sameMode, ...others]) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length === 3) break;
  }
  return out;
}

export default function RelatedProducts({ product }: { product: Product }) {
  const related = relatedTo(product);
  if (related.length === 0) return null;

  return (
    <section className="border-border mt-16 border-t pt-12">
      <p className="text-accent-ink flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase">
        <span className="bg-accent-ink/50 h-px w-5" aria-hidden />
        04 — Da abbinare
      </p>
      <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight">Cavi correlati</h2>

      <ScrollReveal
        stagger={0.06}
        y={20}
        className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
      >
        {related.map((p) => (
          <ProductCard key={p.id} product={p} index={products.findIndex((x) => x.id === p.id)} />
        ))}
      </ScrollReveal>
    </section>
  );
}
