/**
 * Dati di sito condivisi: anagrafica reale del gruppo + configurazione dei tre
 * "mondi" (brand). È la fonte unica per Header, Footer e Hub. I confini di
 * ownership delle sezioni sono in CLAUDE.md.
 */
import { LOGOS } from "@/lib/assets";
import type { ThemeKey } from "@/components/providers/ThemeProvider";

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
