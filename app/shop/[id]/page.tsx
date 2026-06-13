import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import ProductImage from "@/components/shop/ProductImage";
import AddToCartButton from "@/components/shop/cart/AddToCartButton";
import { formatPrice } from "@/components/shop/format";
import { SITE_URL } from "@/lib/site";
import productsData from "@/data/products.json";
import type { Product } from "@/lib/types";

const products = productsData as unknown as Product[];

function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

// Etichette italiane per le chiavi tecniche di `specs`.
const SPEC_LABELS: Record<string, string> = {
  mode: "Modo di ricarica",
  connector: "Connettore",
  plug: "Spina",
  phase: "Fase",
  shape: "Forma del cavo",
  use: "Uso consigliato",
  type: "Tipo",
  coverage: "Copertura",
};

// Le PDP sono statiche: una pagina per ogni prodotto del catalogo.
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Prodotto non trovato" };
  return {
    title: product.name,
    description: `${product.name} — ${product.category}. ${formatPrice(product.price)}. Cavo di ricarica Cavo Perfetto.`,
    alternates: { canonical: `/shop/${product.id}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const specEntries = Object.entries(product.specs).filter(([, v]) => Boolean(v));

  // JSON-LD Product schema (rich result Google). Offers solo se c'è un prezzo.
  const siteUrl = SITE_URL;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.category,
    brand: { "@type": "Brand", name: "Cavo Perfetto" },
    sku: product.id,
  };
  if (siteUrl) jsonLd.url = `${siteUrl}/shop/${product.id}`;
  if (product.price !== null) {
    jsonLd.offers = {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      ...(siteUrl ? { url: `${siteUrl}/shop/${product.id}` } : {}),
    };
  }

  return (
    <Section className="pt-28">
      {/* Dati strutturati per i rich result Google. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-muted mb-8 text-sm">
        <Link href="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span>{product.category}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Immagine (placeholder stilizzato) */}
        <div className="bg-surface border-border overflow-hidden rounded-xl border">
          <div className="relative">
            <ProductImage product={product} priority />
            {product.bestSeller && (
              <Badge variant="accent" className="absolute top-4 left-4 shadow-sm">
                Best seller
              </Badge>
            )}
          </div>
        </div>

        {/* Dettagli */}
        <div>
          <p className="text-muted text-xs font-medium tracking-widest uppercase">
            {product.category}
          </p>
          <h1 className="font-display text-display-sm mt-2 font-bold tracking-tight text-balance">
            {product.name}
          </h1>

          <p className="font-display mt-5 text-3xl font-bold">{formatPrice(product.price)}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton product={product} size="lg" />
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-ink inline-flex items-center text-sm font-medium underline-offset-4 hover:underline"
            >
              Scheda originale ↗
            </a>
          </div>

          {/* Tabella specifiche */}
          {specEntries.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-bold tracking-tight">Specifiche tecniche</h2>
              <dl className="border-border mt-4 divide-y rounded-lg border">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-muted text-sm">{SPEC_LABELS[key] ?? key}</dt>
                    <dd className="text-sm font-medium capitalize">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <p className="text-muted mt-8 text-xs">
            Immagine dimostrativa: le foto reali del prodotto verranno aggiunte in fase di
            pubblicazione.
          </p>
        </div>
      </div>
    </Section>
  );
}
