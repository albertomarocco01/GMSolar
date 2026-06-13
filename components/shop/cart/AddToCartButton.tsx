"use client";

import { useCart } from "./CartProvider";
import Button, { type ButtonProps } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

/**
 * Bottone "Aggiungi al carrello". I servizi senza prezzo (price === null) non
 * sono acquistabili: mostra un CTA che invita al contatto.
 */
export default function AddToCartButton({
  product,
  size = "md",
  variant = "solid",
  className,
  label = "Aggiungi al carrello",
}: {
  product: Pick<Product, "id" | "name" | "price">;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
  label?: string;
}) {
  const { add } = useCart();

  if (product.price === null) {
    return (
      <Button href="/#contatti" variant="outline" size={size} className={className}>
        Richiedi informazioni
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={() => add(product)}
    >
      {label}
    </Button>
  );
}
