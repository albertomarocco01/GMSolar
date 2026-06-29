/**
 * Dati di sito condivisi: anagrafica reale del gruppo + configurazione dei tre
 * "mondi" (brand). È la fonte unica per Header, Footer e Hub. I confini di
 * ownership delle sezioni sono in CLAUDE.md.
 */
import { LOGOS } from "./assets";
import type { ThemeKey } from "./theme";

/* =============================================================
   Identità della PRESENTAZIONE (no branding: è una vetrina di proposte
   di servizi noi → cliente). Niente nomi/loghi/anagrafiche reali.
   Valori neutri, placeholder dichiarati per i contatti della demo.
   ============================================================= */
export const GROUP = {
  name: "Vetrina Servizi",
  legalName: "Vetrina Servizi",
  city: "",
  vat: "",
  /** PLACEHOLDER demo — sostituire col recapito reale al deploy. */
  email: "ciao@vetrina.demo",
  tagline: "Proposte di servizi digitali, in una presentazione interattiva.",
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
 * Dati strutturati schema.org GENERICI (WebSite). È una presentazione senza
 * branding: niente Organization/anagrafica/loghi reali. Iniettato dal RootLayout.
 */
export function groupJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: GROUP.name,
    url: SITE_URL,
    description: GROUP.tagline,
    inLanguage: "it-IT",
  } as const;
}

/* =============================================================
   I tre "mondi" del gruppo. L'ordine racconta la storia:
   produci energia → muoviti elettrico → collega tutto.
   `theme` collega ogni mondo all'accent runtime (vedi ThemeProvider).
   ============================================================= */
export type World = {
  key: "solar" | "mobility" | "shop";
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

/* =============================================================
   REGISTRY DEI SERVIZI — la spina dorsale della presentazione.
   Fonte unica per: la nav dell'Header ("Servizi"), i capitoli della
   scroll-narrativa (home) e i deep-link alle demo. L'ordine = ordine
   di racconto. Ogni voce deep-linka alla sua demo interattiva.
   ============================================================= */
export type ServiceKey =
  | "vetrina"
  | "assistente"
  | "dashboard"
  | "gestionale"
  | "ricarica"
  | "integrazioni"
  | "segnalazioni";

export type Service = {
  key: ServiceKey;
  /** Numero del capitolo nella narrazione. */
  number: string;
  href: `/${string}`;
  /** Etichetta breve (nav). */
  label: string;
  /** Titolo del capitolo (claim). */
  title: string;
  /** Una/due righe che spiegano il servizio. */
  blurb: string;
  /** Tema (accent) della pagina-demo del servizio. */
  theme: ThemeKey;
};

export const SERVICES: Service[] = [
  {
    key: "vetrina",
    number: "01",
    href: "/#vetrina",
    label: "Siti vetrina",
    title: "Siti vetrina che si guardano come un film",
    blurb:
      "Scrollytelling cinematografico, 3D in tempo reale e motion su misura. Tre esempi vivi: energia, mobilità, e-commerce.",
    theme: "solar",
  },
  {
    key: "assistente",
    number: "02",
    href: "/assistente",
    label: "Assistente AI di sito",
    title: "Un assistente che risponde e indirizza",
    blurb:
      "Chatbot AI nel sito vetrina: capisce la domanda, risponde sui contenuti e accompagna l'utente alla sezione o al prodotto giusto.",
    theme: "hub",
  },
  {
    key: "dashboard",
    number: "03",
    href: "/dashboard",
    label: "Dashboard & telemetria",
    title: "Una regìa unica per tutti i siti",
    blurb:
      "Pannello centralizzato: gestisci i contenuti e leggi la telemetria di ogni sito — utenti, interazioni, conversioni — in un colpo d'occhio.",
    theme: "hub",
  },
  {
    key: "gestionale",
    number: "07",
    href: "/gestionale",
    label: "Gestionale con AI",
    title: "Il gestionale che lavora con te",
    blurb:
      "Webapp gestionale con assistente AI integrato: chiedi in linguaggio naturale, ottieni risposte, report e azioni sui tuoi dati.",
    theme: "hub",
  },
  {
    key: "ricarica",
    number: "06",
    href: "/",
    label: "App ricarica EV",
    title: "Ricarica elettrica, assistita dall'AI",
    blurb:
      "App per colonnine di ricarica con assistente di bordo: trova la colonnina, stima costi e tempi, avvia la rotta.",
    theme: "mobility",
  },
  {
    key: "integrazioni",
    number: "05",
    href: "/integrazioni",
    label: "Integrazioni API",
    title: "Ci integriamo con molti sistemi, su richiesta",
    blurb:
      "WhatsApp, email transazionali (Resend), CRM, pagamenti: orchestriamo qualunque sistema con API in flussi automatici.",
    theme: "hub",
  },
  {
    key: "segnalazioni",
    number: "04",
    href: "/segnalazioni",
    label: "Segnalazioni",
    title: "Un canale diretto per dirci tutto",
    blurb:
      "Pannello comodo per inviarci bug e richieste di modifica: con stato, priorità e storico. Niente più email perse.",
    theme: "hub",
  },
];
