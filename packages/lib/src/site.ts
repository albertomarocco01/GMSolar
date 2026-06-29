/**
 * Dati di sito condivisi: anagrafica (neutra) della presentazione e registry
 * dei servizi. Fonte unica per Header, Footer, sitemap e i deep-link alle demo.
 */

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

/** URL dell'hub (landing della presentazione): override via env, default "/". */
export const HUB_URL = process.env.NEXT_PUBLIC_URL_HUB ?? "/";

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
  },
  {
    key: "assistente",
    number: "02",
    href: "/assistente",
    label: "Assistente AI di sito",
    title: "Un assistente che risponde e indirizza",
    blurb:
      "Chatbot AI nel sito vetrina: capisce la domanda, risponde sui contenuti e accompagna l'utente alla sezione o al prodotto giusto.",
  },
  {
    key: "dashboard",
    number: "03",
    href: "/dashboard",
    label: "Dashboard & telemetria",
    title: "Una regìa unica per tutti i siti",
    blurb:
      "Pannello centralizzato: gestisci i contenuti e leggi la telemetria di ogni sito — utenti, interazioni, conversioni — in un colpo d'occhio.",
  },
  {
    key: "gestionale",
    number: "07",
    href: "/gestionale",
    label: "Gestionale con AI",
    title: "Il gestionale che lavora con te",
    blurb:
      "Webapp gestionale con assistente AI integrato: chiedi in linguaggio naturale, ottieni risposte, report e azioni sui tuoi dati.",
  },
  {
    key: "ricarica",
    number: "06",
    href: "/",
    label: "App ricarica EV",
    title: "Ricarica elettrica, assistita dall'AI",
    blurb:
      "App per colonnine di ricarica con assistente di bordo: trova la colonnina, stima costi e tempi, avvia la rotta.",
  },
  {
    key: "integrazioni",
    number: "05",
    href: "/integrazioni",
    label: "Integrazioni API",
    title: "Ci integriamo con molti sistemi, su richiesta",
    blurb:
      "WhatsApp, email transazionali (Resend), CRM, pagamenti: orchestriamo qualunque sistema con API in flussi automatici.",
  },
  {
    key: "segnalazioni",
    number: "04",
    href: "/segnalazioni",
    label: "Segnalazioni",
    title: "Un canale diretto per dirci tutto",
    blurb:
      "Pannello comodo per inviarci bug e richieste di modifica: con stato, priorità e storico. Niente più email perse.",
  },
];
