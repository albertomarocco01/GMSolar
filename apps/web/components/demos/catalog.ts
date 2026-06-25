/**
 * Catalogo del Demo launcher: legge la fonte dati JSON, la tipizza e fornisce
 * le mappe di presentazione (accent per brand, etichette di stato, metadati di
 * sezione). Tutto ciò che è "dato" sta nel JSON; qui c'è solo la derivazione.
 */
import data from "@/data/demos.json";
import type { AccentKey, Demo, DemoSection, DemoStatus } from "./types";

/** Elenco completo delle demo (l'ordine del JSON è quello mostrato). */
export const DEMOS = data as unknown as Demo[];

/**
 * Accent per brand espressi come CSS var dei token (vedi packages/tokens).
 * Sono colori STATICI di brand: sulla route /demos l'accent runtime è quello
 * del gruppo (lime), quindi ogni card porta il proprio colore via questi valori,
 * non via `--accent`. `ink` = variante leggibile come testo; `soft` = tinta di
 * sfondo. Per il gruppo l'ink è calcolato come negli altri brand (mix verso il
 * foreground, così resta leggibile in light e dark).
 */
export const ACCENTS: Record<AccentKey, { fill: string; ink: string; soft: string }> = {
  solar: {
    fill: "var(--color-solar)",
    ink: "var(--solar-ink)",
    soft: "color-mix(in oklab, var(--color-solar) 16%, transparent)",
  },
  mobility: {
    fill: "var(--color-mobility)",
    ink: "var(--mobility-ink)",
    soft: "color-mix(in oklab, var(--color-mobility) 18%, transparent)",
  },
  shop: {
    fill: "var(--color-shop)",
    ink: "var(--shop-ink)",
    soft: "color-mix(in oklab, var(--color-shop) 16%, transparent)",
  },
  group: {
    fill: "var(--color-brand-500)",
    ink: "color-mix(in oklab, var(--color-brand-500), var(--foreground) 42%)",
    soft: "color-mix(in oklab, var(--color-brand-500) 16%, transparent)",
  },
};

/** Etichetta breve del brand mostrata in alto nella card. */
export const BRAND_LABEL: Record<AccentKey, string> = {
  solar: "GM Solar",
  mobility: "GMobility",
  shop: "Cavo Perfetto",
  group: "GM Group",
};

/** Stato → etichetta italiana + colore del pallino (utility Tailwind). */
export const STATUS: Record<DemoStatus, { label: string; dot: string }> = {
  ready: { label: "Pronto", dot: "bg-emerald-500" },
  wip: { label: "In lavorazione", dot: "bg-amber-500" },
};

/** Metadati delle sezioni della dashboard, nell'ordine di visualizzazione. */
export const SECTIONS: { key: DemoSection; eyebrow: string; title: string; description: string }[] =
  [
    {
      key: "worlds",
      eyebrow: "I mondi",
      title: "Le esperienze",
      description: "I tre brand del gruppo (più l'hub) con la rispettiva tecnica visiva.",
    },
    {
      key: "ai",
      eyebrow: "Demo AI",
      title: "Prototipi agentici",
      description: "Funzioni AI integrate nei mondi: lead, analytics, agente di bordo, advisor.",
    },
    {
      key: "planned",
      eyebrow: "Roadmap",
      title: "In arrivo",
      description: "Demo pianificate per le prossime fasi, non ancora navigabili.",
    },
  ];

/** Demo di una sezione, nell'ordine del catalogo. */
export function demosBySection(section: DemoSection): Demo[] {
  return DEMOS.filter((demo) => demo.section === section);
}
