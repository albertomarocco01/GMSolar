"use client";

import { useCart } from "./CartProvider";
import Button, { type ButtonProps } from "@gmgroup/ui/Button";
import { GROUP } from "@gmgroup/lib/site";
import type { Product } from "@gmgroup/lib/types";

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
      <Button
        href={`mailto:${GROUP.email}?subject=${encodeURIComponent("Richiesta informazioni — " + product.name)}`}
        variant="outline"
        size={size}
        className={className}
      >
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
