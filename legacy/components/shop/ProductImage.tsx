import { cn } from "@gmgroup/lib/utils";
import type { Product } from "@gmgroup/lib/types";
import { isAdapter, isSchuko, isService } from "./product-copy";

/**
 * Placeholder STILIZZATO per le foto prodotto (che non esistono ancora).
 *
 * Non più un blocco accent pieno: una "lastra tecnica" su superficie neutra
 * (carta da progetto + un solo bagliore accent) con un GLIFO che CAMBIA per
 * tipo di prodotto (connettore Tipo 2 trifase/monofase, spina Schuko,
 * adattatore, scudo garanzia). Così i segnaposto sembrano un sistema
 * disegnato, non immagini mancanti. Quando arriveranno le foto reali basta
 * sostituire questo componente con un <Image> (l'API resta `product`).
 *
 * API invariata — { product, className?, priority? } e box aspect-[4/3] — perché
 * la consumano più punti (card, PDP, correlati, miniatura carrello) e anche il
 * Cable Advisor (zona della chat parallela).
 */
export default function ProductImage({
  product,
  className,
  priority,
}: {
  product: Product;
  className?: string;
  /** Più grande/dettagliato per la PDP. */
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-surface @container relative isolate flex aspect-[4/3] w-full items-center justify-center overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {/* Un solo bagliore accent (niente wash): dà profondità restando sobrio. */}
      <div className="bg-accent/12 absolute top-1/2 left-1/2 -z-10 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

      {/* Carta da progetto: griglia hairline che sfuma ai bordi. */}
      <div className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(0deg,var(--color-foreground)_0_1px,transparent_1px_24px),repeating-linear-gradient(90deg,var(--color-foreground)_0_1px,transparent_1px_24px)] opacity-[0.05] mask-[radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      {/* Cornice interna + crocini d'angolo: dettaglio "da scheda tecnica". */}
      <div className="border-accent-ink/15 pointer-events-none absolute inset-3 rounded-[2px] border" />
      <CornerTicks />

      <ConnectorGlyph product={product} priority={priority} />

      {/* Filigrana col connettore — nascosta sulle miniature (container query). */}
      <span className="text-accent-ink/60 absolute right-3 bottom-3 left-3 hidden text-right text-[11px] font-medium tracking-wide @[9rem]:block">
        {product.specs.connector ? `Mennekes · ${product.specs.connector}` : "Cavo Perfetto"}
      </span>
    </div>
  );
}

/** Quattro crocini di registro agli angoli (printer's marks). */
function CornerTicks() {
  const base = "border-accent-ink/25 absolute h-2.5 w-2.5";
  return (
    <>
      <span className={cn(base, "top-2.5 left-2.5 border-t border-l")} />
      <span className={cn(base, "top-2.5 right-2.5 border-t border-r")} />
      <span className={cn(base, "bottom-2.5 left-2.5 border-b border-l")} />
      <span className={cn(base, "right-2.5 bottom-2.5 border-r border-b")} />
    </>
  );
}

/** Il glifo cambia per tipo di prodotto, tutto derivato da `specs`. */
function ConnectorGlyph({ product, priority }: { product: Product; priority?: boolean }) {
  const size = priority ? "h-[58%]" : "h-3/5";
  const cls = cn("w-auto text-accent-ink/75", size);
  const monofase = product.specs.phase === "monofase";

  if (isService(product)) return <WarrantyGlyph className={cls} />;
  if (isAdapter(product)) return <AdapterGlyph className={cls} />;
  if (isSchuko(product)) return <SchukoGlyph className={cls} />;
  return <Type2Glyph className={cls} monofase={monofase} product={product} />;
}

/* ---------------- Glifi (SVG, viewBox 0 0 120 120) ---------------- */

/** Faccia connettore Tipo 2 + cavo (coil se spiralato, sweep se liscio). */
function Type2Glyph({
  className,
  monofase,
  product,
}: {
  className?: string;
  monofase: boolean;
  product: Product;
}) {
  const spiralato = product.specs.shape === "spiralato";
  const long = (product.specs as { length?: string }).length === "10 m";

  // Coda del cavo: spirale (3 anse) oppure curva morbida; più lunga per 10 m.
  const tail = spiralato
    ? "M60 80c-13 0-13 9 0 9s13 9 0 9-13 9 0 9-13 9 0 9"
    : long
      ? "M60 80c14 6 16 16 6 22s-12 12 4 16"
      : "M60 80c10 5 12 12 4 18";

  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} strokeWidth={3}>
      <circle cx="60" cy="50" r="31" stroke="currentColor" opacity="0.85" />
      {/* Pin: trifase = 7, monofase = 5. Il pin in alto è l'unico fill accent. */}
      <circle cx="60" cy="36" r="4.2" className="fill-accent" stroke="none" />
      <circle cx="49" cy="46" r="4.6" fill="currentColor" stroke="none" />
      <circle cx="71" cy="46" r="4.6" fill="currentColor" stroke="none" />
      {!monofase && (
        <>
          <circle cx="44" cy="58" r="4.6" fill="currentColor" stroke="none" />
          <circle cx="76" cy="58" r="4.6" fill="currentColor" stroke="none" />
        </>
      )}
      <circle cx="52" cy="67" r="5" fill="currentColor" stroke="none" />
      <circle cx="68" cy="67" r="5" fill="currentColor" stroke="none" />
      <path d={tail} stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

/** Cavo che termina con una spina domestica Schuko (Modo 2). */
function SchukoGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} strokeWidth={3}>
      <circle cx="60" cy="40" r="26" stroke="currentColor" opacity="0.85" />
      <circle cx="60" cy="30" r="3.6" className="fill-accent" stroke="none" />
      <circle cx="51" cy="44" r="4.4" fill="currentColor" stroke="none" />
      <circle cx="69" cy="44" r="4.4" fill="currentColor" stroke="none" />
      <path d="M60 66c8 5 10 12 2 17" stroke="currentColor" strokeLinecap="round" />
      {/* Testa Schuko rotonda + due poli + clip di terra. */}
      <circle cx="62" cy="96" r="15" stroke="currentColor" />
      <circle cx="57" cy="96" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="67" cy="96" r="2.6" fill="currentColor" stroke="none" />
      <path d="M50 90v12M74 90v12" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

/** Adattatore: testa Tipo 2 + testa Schuko unite da un corpo corto. */
function AdapterGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} strokeWidth={3}>
      <circle cx="38" cy="60" r="20" stroke="currentColor" opacity="0.85" />
      <circle cx="38" cy="52" r="3" className="fill-accent" stroke="none" />
      <circle cx="32" cy="62" r="3.4" fill="currentColor" stroke="none" />
      <circle cx="44" cy="62" r="3.4" fill="currentColor" stroke="none" />
      <rect x="56" y="52" width="16" height="16" rx="3" stroke="currentColor" />
      <circle cx="92" cy="60" r="16" stroke="currentColor" />
      <circle cx="88" cy="60" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="96" cy="60" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Scudo (servizio/garanzia): non deve sembrare un cavo. */
function WarrantyGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} strokeWidth={3}>
      <path
        d="M60 18l30 11v24c0 22-14 35-30 43-16-8-30-21-30-43V29z"
        stroke="currentColor"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <path
        d="M47 60l9 9 18-19"
        className="stroke-accent"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
