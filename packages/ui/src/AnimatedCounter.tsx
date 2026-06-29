"use client";

import { useRef } from "react";
import { gsap } from "@gmgroup/lib/gsap";
import { EASE, prefersReducedMotion, useIsoLayoutEffect } from "@gmgroup/lib/motion";

export type AnimatedCounterProps = {
  /** Valore finale da raggiungere. */
  value: number;
  /** Durata del conteggio in secondi. */
  duration?: number;
  /** Cifre decimali. */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Locale per la formattazione numerica (separatori migliaia/decimali). */
  locale?: string;
  className?: string;
};

/**
 * Conteggio animato da 0 al valore quando entra in viewport (una sola volta).
 * Rispetta prefers-reduced-motion: mostra subito il valore finale.
 * Il markup SSR contiene già il valore finale formattato (no-JS friendly e
 * niente mismatch di idratazione).
 */
export default function AnimatedCounter({
  value,
  duration = 1.8,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "it-IT",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const format = (n: number) =>
    `${prefix}${new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      // useGrouping "always": il default "auto" rispetta minimumGroupingDigits del
      // CLDR (per it-IT = 2 → niente separatore per i numeri a 4 cifre), ma l'ICU di
      // Node lo ignora e raggruppa comunque. Risultato: SSR "1.428" vs client "1428"
      // → mismatch di idratazione. "always" forza il raggruppamento in entrambi.
      useGrouping: "always",
    }).format(n)}${suffix}`;

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = format(value);
      return;
    }

    const obj = { n: 0 };
    el.textContent = format(0);
    const tween = gsap.to(obj, {
      n: value,
      duration,
      ease: EASE.out,
      onUpdate: () => {
        el.textContent = format(obj.n);
      },
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, duration, decimals, prefix, suffix, locale]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
