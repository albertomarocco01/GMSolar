import { cn } from "@gmgroup/lib/utils";
import type { Product } from "@gmgroup/lib/types";

/**
 * Placeholder STILIZZATO per le foto prodotto (che non esistono ancora):
 * blocco gradiente sull'accent del brand + motivo connettore + nome.
 * Pensato per sembrare voluto, non un'immagine rotta. Quando arriveranno le
 * foto reali in /assets/products, basta sostituire questo componente con un
 * <Image> (l'API resta `product`).
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
  const spiralato = product.specs.shape === "spiralato";

  return (
    <div
      className={cn(
        "bg-accent-soft relative isolate flex aspect-[4/3] w-full items-center justify-center overflow-hidden",
        className,
      )}
      aria-hidden
    >
      {/* Velo gradiente per dare profondità al blocco accent. */}
      <div className="from-accent/25 absolute inset-0 -z-10 bg-gradient-to-br via-transparent to-transparent" />
      <div className="bg-accent/15 absolute -top-10 -right-10 -z-10 h-32 w-32 rounded-full blur-2xl" />

      {/* Motivo "connettore Tipo 2": cerchio + pin, oppure spire per lo spiralato. */}
      <svg
        viewBox="0 0 120 120"
        className={cn("text-accent-ink/70", priority ? "h-40 w-40" : "h-24 w-24")}
        fill="none"
      >
        <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="3" opacity="0.55" />
        {spiralato ? (
          // Spire: indica il cavo spiralato.
          <path
            d="M40 50c0-8 40-8 40 0s-40 8-40 16 40 8 40 16-40 8-40 0"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ) : (
          // Pin del connettore (schematico).
          <>
            <circle cx="48" cy="50" r="5" fill="currentColor" />
            <circle cx="72" cy="50" r="5" fill="currentColor" />
            <circle cx="48" cy="72" r="5" fill="currentColor" />
            <circle cx="72" cy="72" r="5" fill="currentColor" />
            <circle cx="60" cy="40" r="4" fill="currentColor" />
          </>
        )}
      </svg>

      {/* Filigrana col nome, in basso. */}
      <span className="text-accent-ink/80 absolute right-3 bottom-3 left-3 text-right text-xs font-medium tracking-wide">
        {product.specs.connector ? `Mennekes · ${product.specs.connector}` : "Cavo Perfetto"}
      </span>
    </div>
  );
}
