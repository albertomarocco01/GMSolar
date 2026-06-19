/**
 * Dati di sito condivisi: anagrafica reale del gruppo + configurazione dei tre
 * "mondi" (brand). È la fonte unica per Header, Footer e Hub. I confini di
 * ownership delle sezioni sono in CLAUDE.md.
 */
import { LOGOS } from "./assets";
import type { ThemeKey } from "./theme";

/* =============================================================
   Anagrafica gruppo (dati REALI noti).
   NB: email/telefono sono PLACEHOLDER da sostituire con i recapiti
   ufficiali (vedi NOTES-shared.md). Non inventare dati non verificati.
   ============================================================= */
export const GROUP = {
  name: "GM Group",
  legalName: "GM Solar S.R.L.",
  city: "Settimo Torinese (TO)",
  vat: "10086000014",
  /** PLACEHOLDER — sostituire con l'email ufficiale. */
  email: "info@gmgroup.it",
  tagline: "Un gruppo, tre mondi: energia, mobilità, ricarica.",
} as const;

/* =============================================================
   URL canonico del sito. Serve a metadataBase, OpenGraph, sitemap,
   robots e ai dati strutturati. Priorità:
   1) NEXT_PUBLIC_SITE_URL (impostala su Vercel col dominio reale)
   2) dominio di produzione Vercel (auto, in fase di build)
   3) localhost in sviluppo
   ============================================================= */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");

/**
 * Dati strutturati schema.org per il gruppo (Organization + LocalBusiness).
 * Anagrafica REALE confermata (GM Solar S.R.L., Settimo Torinese, P.IVA);
 * l'email è ancora un PLACEHOLDER (vedi NOTES-shared.md). Iniettato site-wide
 * dal RootLayout per i rich result / knowledge panel di Google.
 */
export function groupJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    name: GROUP.name,
    legalName: GROUP.legalName,
    url: SITE_URL,
    email: GROUP.email,
    vatID: `IT${GROUP.vat}`,
    taxID: GROUP.vat,
    slogan: GROUP.tagline,
    logo: `${SITE_URL}${LOGOS.gmSolar}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Settimo Torinese",
      addressRegion: "TO",
      addressCountry: "IT",
    },
    areaServed: "IT",
    // I tre brand operativi del gruppo.
    brand: WORLDS.map((w) => ({
      "@type": "Brand",
      name: w.brand,
      url: `${SITE_URL}${w.href}`,
    })),
  } as const;
}

/* =============================================================
   I tre "mondi" del gruppo. L'ordine racconta la storia:
   produci energia → muoviti elettrico → collega tutto.
   `theme` collega ogni mondo all'accent runtime (vedi ThemeProvider).
   ============================================================= */
export type World = {
  key: Exclude<ThemeKey, "hub">;
  href: `/${string}`;
  /** Nome del brand (per UI/loghi). */
  brand: string;
  /** Etichetta breve per nav/switcher. */
  label: string;
  /** Passo della narrazione (badge "01/02/03"). */
  step: "01" | "02" | "03";
  /** Ruolo nell'ecosistema (claim breve). */
  role: string;
  tagline: string;
  description: string;
  logo: string;
  /** Colore statico di brand (CSS var) per FILL/bordi delle "porte". */
  colorVar: string;
  /** Variante "ink" theme-aware dello stesso brand, leggibile come TESTO. */
  inkVar: string;
};

export const WORLDS: World[] = [
  {
    key: "solar",
    href: "/solar",
    brand: "GM Solar",
    label: "Solar",
    step: "01",
    role: "Produci energia",
    tagline: "Il sole che lavora per te",
    description:
      "EPC fotovoltaico: progettazione, installazione e manutenzione di impianti residenziali, industriali e solar farm.",
    logo: LOGOS.gmSolar,
    colorVar: "var(--color-solar)",
    inkVar: "var(--solar-ink)",
  },
  {
    key: "mobility",
    href: "/mobility",
    brand: "GMobility",
    label: "Mobility",
    step: "02",
    role: "Muoviti elettrico",
    tagline: "Ricarica dove vuoi",
    description:
      "Wallbox e colonnine di ricarica Mennekes per casa, azienda e spazi pubblici: la tua energia diventa movimento.",
    logo: LOGOS.gmobility,
    colorVar: "var(--color-mobility)",
    inkVar: "var(--mobility-ink)",
  },
  {
    key: "shop",
    href: "/shop",
    brand: "Cavo Perfetto",
    label: "Shop",
    step: "03",
    role: "Collega tutto",
    tagline: "Il cavo giusto, sempre",
    description:
      "E-commerce di cavi di ricarica Mennekes: l'accessorio che chiude il cerchio tra auto e punto di ricarica.",
    logo: LOGOS.cavoPerfetto,
    colorVar: "var(--color-shop)",
    inkVar: "var(--shop-ink)",
  },
];

/* =============================================================
   Navigazione cross-app (monorepo: ogni mondo è un'app Next a sé).
   In un deploy combinato i path relativi (/solar, …) bastano; in deploy
   separati imposta gli URL assoluti via env. Default = path della sezione.
   ============================================================= */
const WORLD_URL_BY_KEY: Record<World["key"], string | undefined> = {
  solar: process.env.NEXT_PUBLIC_URL_SOLAR,
  mobility: process.env.NEXT_PUBLIC_URL_MOBILITY,
  shop: process.env.NEXT_PUBLIC_URL_SHOP,
};

/** URL del mondo: override via env, altrimenti il path della sezione. */
export function worldHref(world: World): string {
  return WORLD_URL_BY_KEY[world.key] ?? world.href;
}

/** URL dell'hub (landing del gruppo): override via env, default "/". */
export const HUB_URL = process.env.NEXT_PUBLIC_URL_HUB ?? "/";

/* =============================================================
   Demo AI (prototipi agentici) — fonte unica per il menu "Demo AI"
   dell'Header e per eventuali indici. Ogni voce è una route del sito.
   L'ordine segue i mondi (Solar prima, poi Mobility).
   ============================================================= */
export type Demo = {
  href: `/${string}`;
  /** Etichetta breve per il menu. */
  label: string;
  /** Una riga di descrizione mostrata sotto l'etichetta. */
  blurb: string;
  /** Mondo di appartenenza (per il tag colorato nel menu). */
  world: World["key"];
};

export const DEMOS: Demo[] = [
  {
    href: "/solar/lead",
    label: "Lead Qualifier AI",
    blurb: "Qualifica il lead e consiglia Monofase, Trifase o Accumulo.",
    world: "solar",
  },
  {
    href: "/solar/analytics",
    label: "Analytics in linguaggio naturale",
    blurb: "Domanda in italiano → SQL → grafici, con guardrail GDPR.",
    world: "solar",
  },
  {
    href: "/mobility/agent",
    label: "Agente di ricarica di bordo",
    blurb: "Trova la colonnina, prenota lo stallo, avvia la rotta.",
    world: "mobility",
  },
];
