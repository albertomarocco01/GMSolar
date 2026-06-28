import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import { Truck, RotateCcw, BadgeCheck } from "lucide-react";
import ProductImage from "@/components/shop/ProductImage";
import AddToCartButton from "@/components/shop/cart/AddToCartButton";
import RelatedProducts from "@/components/shop/RelatedProducts";
import { formatPrice } from "@/components/shop/format";
import { buildDeck, buildDescription, whyReasons } from "@/components/shop/product-copy";
import { SITE_URL } from "@gmgroup/lib/site";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

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
  current: "Corrente max",
  length: "Lunghezza",
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
  const reasons = whyReasons(product);
  const index = products.findIndex((p) => p.id === product.id);
  const figLabel = [product.specs.connector, product.specs.plug].filter(Boolean).join(" · ");

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

      {/* Masthead */}
      <nav className="text-muted text-sm">
        <Link href="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span>{product.category}</span>
      </nav>

      <div className="mt-6 border-b border-border pb-8">
        <p className="text-accent-ink flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase">
          <span className="bg-accent-ink/50 h-px w-5" aria-hidden />
          Scheda prodotto
        </p>
        <p className="text-muted mt-3 max-w-2xl text-lg">{buildDeck(product)}</p>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Colonna immagine (sticky da desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative">
            <div
              aria-hidden
              className="bg-accent/10 absolute -inset-4 -z-10 rounded-[2rem] blur-3xl"
            />
            <div className="bg-surface border-border overflow-hidden rounded-xl border">
              <div className="relative">
                <ProductImage product={product} priority />
                {product.bestSeller && (
                  <Badge variant="accent" className="absolute top-4 left-4 shadow-sm">
                    Best seller
                  </Badge>
                )}
                {index >= 0 && (
                  <span className="bg-background/80 text-muted absolute top-4 right-4 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide tabular-nums backdrop-blur">
                    N° {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
              {figLabel && (
                <p className="border-border text-muted border-t px-4 py-2 text-[11px] tracking-wide">
                  Fig. — {figLabel}
                </p>
              )}
            </div>
          </div>

          {/* Trust micro-row */}
          <ul className="text-muted mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {[
              { Icon: Truck, t: "Spedizione gratuita" },
              { Icon: RotateCcw, t: "Reso 30 giorni" },
              { Icon: BadgeCheck, t: "Rivendita autorizzata Mennekes" },
            ].map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-1.5">
                <Icon className="text-accent-ink h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {t}
              </li>
            ))}
          </ul>

          <p className="text-muted mt-4 text-xs">
            Immagine dimostrativa: le foto reali del prodotto verranno aggiunte in fase di
            pubblicazione.
          </p>
        </div>

        {/* Colonna acquisto + info */}
        <div>
          <p className="text-muted text-xs font-medium tracking-widest uppercase">
            {product.category}
          </p>
          <h1 className="font-display text-display-sm mt-2 font-semibold tracking-tight text-balance">
            {product.name}
          </h1>

          <p className="font-display mt-5 text-3xl font-semibold tabular-nums">
            {formatPrice(product.price)}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
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

          {product.price !== null && (
            <p className="text-muted mt-3 text-sm">
              Spedizione gratuita · Consegna 2–4 giorni · Reso facile
            </p>
          )}

          {/* Descrizione */}
          <div className="mt-10">
            <h2 className="font-display text-lg font-bold tracking-tight">Descrizione</h2>
            <p className="text-muted mt-3 leading-relaxed">{buildDescription(product)}</p>
          </div>

          {/* Specifiche */}
          {specEntries.length > 0 && (
            <div className="mt-10">
              <p className="text-accent-ink flex items-center gap-2 text-xs font-semibold tracking-[0.22em] uppercase">
                <span className="bg-accent-ink/50 h-px w-5" aria-hidden />
                03 — Dettagli
              </p>
              <h2 className="font-display mt-3 text-lg font-bold tracking-tight">
                Specifiche tecniche
              </h2>
              <dl className="border-border mt-4 divide-y rounded-lg border text-sm">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-muted">{SPEC_LABELS[key] ?? key}</dt>
                    <dd className="font-medium capitalize">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Perché questo cavo */}
          {reasons.length > 0 && (
            <div className="bg-surface border-border mt-10 rounded-xl border p-6">
              <h2 className="font-display text-lg font-bold tracking-tight">Perché questo cavo</h2>
              <ScrollReveal stagger={0.08} y={14} className="mt-5 space-y-5">
                {reasons.map((r, i) => (
                  <div key={r.title} className="flex gap-4">
                    <span className="text-accent-ink font-display text-sm font-bold tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-muted mt-0.5 text-sm leading-snug">{r.body}</p>
                    </div>
                  </div>
                ))}
              </ScrollReveal>
            </div>
          )}
        </div>
      </div>

      {/* Cavi correlati (build-time, niente fetch client) */}
      <RelatedProducts product={product} />
    </Section>
  );
}
