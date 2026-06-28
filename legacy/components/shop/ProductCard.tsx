import Link from "next/link";
import Card from "@gmgroup/ui/Card";
import Badge from "@gmgroup/ui/Badge";
import ProductImage from "./ProductImage";
import AddToCartButton from "./cart/AddToCartButton";
import { formatPrice } from "./format";
import { cardSpecLine } from "./product-copy";
import type { Product } from "@gmgroup/lib/types";

/**
 * Scheda prodotto della griglia — premium e sobria. L'immagine è il placeholder
 * stilizzato (zoom morbido all'hover); titolo e immagine linkano alla PDP.
 * `index` (posizione nel catalogo completo) rende l'indice editoriale "N° NN".
 */
export default function ProductCard({ product, index }: { product: Product; index?: number }) {
  const specs = cardSpecLine(product);

  return (
    <Card interactive className="group flex h-full flex-col overflow-hidden p-0">
      <Link
        href={`/shop/${product.id}`}
        className="relative block focus-visible:outline-none"
        aria-label={product.name}
      >
        <div className="border-border overflow-hidden border-b">
          <div className="ease-out-expo transition-transform duration-(--duration-base) group-hover:scale-[1.03]">
            <ProductImage product={product} />
          </div>
        </div>

        {product.bestSeller && (
          <Badge variant="accent" className="absolute top-3 left-3 shadow-sm">
            Best seller
          </Badge>
        )}

        {typeof index === "number" && (
          <span className="bg-background/80 text-muted group-hover:bg-accent-soft absolute top-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide tabular-nums backdrop-blur transition-colors">
            N° {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-muted flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase">
          <span className="bg-accent-ink/50 h-px w-4 shrink-0" aria-hidden />
          <span className="truncate">{product.category}</span>
        </p>

        <Link
          href={`/shop/${product.id}`}
          className="hover:text-accent-ink mt-2 transition-colors"
        >
          <h3 className="font-display line-clamp-2 text-base leading-snug font-semibold tracking-tight text-balance">
            {product.name}
          </h3>
        </Link>

        {specs.length > 0 && (
          <p className="text-muted mt-3 truncate text-xs capitalize">{specs.join(" · ")}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-display text-lg font-semibold tabular-nums">
            {formatPrice(product.price)}
          </span>
          <AddToCartButton product={product} size="sm" label="Aggiungi" />
        </div>
      </div>
    </Card>
  );
}
