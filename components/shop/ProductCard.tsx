import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProductImage from "./ProductImage";
import AddToCartButton from "./cart/AddToCartButton";
import { formatPrice, specChips } from "./format";
import type { Product } from "@/lib/types";

/**
 * Scheda prodotto della griglia. L'immagine è il placeholder stilizzato; tutta
 * la card (tranne il bottone) è un link alla PDP.
 */
export default function ProductCard({ product }: { product: Product }) {
  const chips = specChips(product).slice(0, 3);

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden p-0">
      <Link
        href={`/shop/${product.id}`}
        className="block focus-visible:outline-none"
        aria-label={product.name}
      >
        <div className="relative">
          <ProductImage product={product} />
          {product.bestSeller && (
            <Badge variant="accent" className="absolute top-3 left-3 shadow-sm">
              Best seller
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-muted text-xs font-medium tracking-widest uppercase">{product.category}</p>
        <Link href={`/shop/${product.id}`} className="mt-1">
          <h3 className="font-display text-base leading-snug font-bold tracking-tight text-balance">
            {product.name}
          </h3>
        </Link>

        {chips.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li
                key={chip}
                className="bg-surface-2 text-muted rounded-full px-2.5 py-0.5 text-xs capitalize"
              >
                {chip}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="font-display text-lg font-bold">{formatPrice(product.price)}</span>
          <AddToCartButton product={product} size="sm" label="Aggiungi" />
        </div>
      </div>
    </Card>
  );
}
