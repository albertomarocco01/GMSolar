/**
 * KNOWLEDGE BASE locale dell'assistente di sito (servizio #2 della vetrina).
 *
 * Fonte unica, tipizzata e priva di dipendenze (importabile sia dalla route AI
 * server-side sia, in teoria, dal client). Ogni voce descrive un servizio o
 * risponde a una FAQ generica e porta un `href` verso la sezione pertinente
 * (gli href rispecchiano SERVICES in @gmgroup/lib/site). È il CONTESTO che la
 * route passa al modello e, senza chiave, il corpus su cui gira il ranking
 * deterministico per keyword.
 */

/** Voce della knowledge base: contenuto + deep-link + tag per il ranking. */
export interface KbEntry {
  /** Identificativo stabile (slug). */
  id: string;
  /** Titolo breve: usato come label dei suggerimenti. */
  titolo: string;
  /** Risposta sintetica in italiano, autosufficiente. */
  contenuto: string;
  /** Deep-link alla sezione/servizio pertinente. */
  href: string;
  /** Parole chiave per il match (sinonimi inclusi). */
  tag: string[];
}

export const KB: KbEntry[] = [
  /* -------------------------- I 7 servizi della vetrina -------------------------- */
  {
    id: "vetrina",
    titolo: "Siti vetrina cinematografici",
    contenuto:
      "Realizziamo siti vetrina che si guardano come un film: scrollytelling, 3D in tempo reale e motion su misura, sempre veloci e accessibili. Trovi tre esempi vivi — energia, mobilità ed e-commerce — costruiti con lo stesso design system.",
    href: "/solar",
    tag: [
      "sito",
      "siti",
      "vetrina",
      "landing",
      "scrollytelling",
      "3d",
      "animazioni",
      "motion",
      "esempio",
      "demo",
      "portfolio",
    ],
  },
  {
    id: "assistente",
    titolo: "Assistente AI di sito",
    contenuto:
      "Un chatbot AI integrato nel sito che capisce la domanda, risponde sui contenuti e accompagna l'utente alla sezione o al prodotto giusto. Funziona anche senza chiave AI grazie a un motore deterministico di fallback, così la demo non si rompe mai.",
    href: "/assistente",
    tag: [
      "assistente",
      "chatbot",
      "chat",
      "ai",
      "bot",
      "supporto",
      "domande",
      "risposte",
      "agente",
      "conversazione",
    ],
  },
  {
    id: "dashboard",
    titolo: "Dashboard & telemetria",
    contenuto:
      "Un pannello centralizzato per gestire i contenuti di tutti i tuoi siti e leggerne la telemetria — utenti, interazioni, conversioni — in un colpo d'occhio. Una regìa unica al posto di tante console separate.",
    href: "/dashboard",
    tag: [
      "dashboard",
      "telemetria",
      "analytics",
      "metriche",
      "statistiche",
      "conversioni",
      "pannello",
      "monitoraggio",
      "dati",
      "report",
    ],
  },
  {
    id: "gestionale",
    titolo: "Gestionale con AI",
    contenuto:
      "Una webapp gestionale con assistente AI integrato: chiedi in linguaggio naturale e ottieni risposte, report e azioni sui tuoi dati. Il gestionale che lavora con te, senza imparare menu complicati.",
    href: "/gestionale",
    tag: [
      "gestionale",
      "gestione",
      "webapp",
      "crm",
      "erp",
      "ordini",
      "magazzino",
      "report",
      "linguaggio naturale",
      "automazione",
    ],
  },
  {
    id: "ricarica",
    titolo: "App ricarica EV",
    contenuto:
      "App per colonnine di ricarica con assistente di bordo: trova la colonnina più vicina, stima costi e tempi e avvia la rotta. Pensata per chi guida elettrico e vuole ricaricare senza pensieri.",
    href: "/mobility/agent",
    tag: [
      "ricarica",
      "ev",
      "auto elettrica",
      "colonnina",
      "colonnine",
      "wallbox",
      "mobilità",
      "mobility",
      "app",
      "mappa",
      "rotta",
    ],
  },
  {
    id: "integrazioni",
    titolo: "Integrazioni API",
    contenuto:
      "Connettiamo ciò che usi già: WhatsApp, email transazionali (Resend), CRM e pagamenti. Orchestriamo qualunque sistema via API in flussi automatici, così i dati passano da soli da un punto all'altro.",
    href: "/integrazioni",
    tag: [
      "integrazioni",
      "api",
      "whatsapp",
      "email",
      "resend",
      "crm",
      "pagamenti",
      "webhook",
      "automazioni",
      "flussi",
      "collegare",
    ],
  },
  {
    id: "segnalazioni",
    titolo: "Segnalazioni e supporto",
    contenuto:
      "Un canale diretto per inviarci bug e richieste di modifica, con stato, priorità e storico. Niente più email perse: ogni segnalazione è tracciata dall'apertura alla chiusura.",
    href: "/segnalazioni",
    tag: [
      "segnalazioni",
      "supporto",
      "assistenza",
      "bug",
      "ticket",
      "richieste",
      "modifiche",
      "manutenzione",
      "stato",
      "priorità",
    ],
  },

  /* ------------------------------ FAQ generiche ------------------------------ */
  {
    id: "panoramica",
    titolo: "Panoramica dei servizi",
    contenuto:
      "Proponiamo sette servizi digitali pensati per lavorare insieme: siti vetrina, assistente AI, dashboard & telemetria, gestionale con AI, app di ricarica EV, integrazioni API e un canale di segnalazioni. Puoi adottarli singolarmente o come ecosistema unico.",
    href: "/",
    tag: [
      "servizi",
      "panoramica",
      "cosa fate",
      "offerta",
      "ecosistema",
      "tutto",
      "elenco",
      "overview",
    ],
  },
  {
    id: "come-funziona",
    titolo: "Come funziona il progetto",
    contenuto:
      "Lavoriamo a fasi: discovery e obiettivi, prototipo navigabile, sviluppo iterativo con revisioni frequenti e messa online. Dopo ogni fase ci fermiamo, mostriamo il risultato e procediamo solo col tuo via.",
    href: "/",
    tag: [
      "come funziona",
      "processo",
      "metodo",
      "fasi",
      "lavoro",
      "workflow",
      "iter",
      "discovery",
      "prototipo",
    ],
  },
  {
    id: "tempi",
    titolo: "Tempi di realizzazione",
    contenuto:
      "I tempi dipendono dallo scopo: un sito vetrina o un assistente AI demo richiedono in genere poche settimane, mentre gestionale, dashboard e integrazioni si pianificano per moduli. Definiamo insieme una roadmap con scadenze chiare.",
    href: "/",
    tag: [
      "tempi",
      "tempistiche",
      "quanto tempo",
      "durata",
      "consegna",
      "scadenze",
      "roadmap",
      "settimane",
      "quando",
    ],
  },
  {
    id: "prezzi",
    titolo: "Prezzi indicativi",
    contenuto:
      "Il preventivo è su misura in base a funzionalità e integrazioni. A titolo indicativo: i siti vetrina partono da progetti contenuti, le piattaforme (gestionale, dashboard) si quotano a moduli. Ti diamo una stima trasparente dopo una breve discovery.",
    href: "/",
    tag: [
      "prezzi",
      "prezzo",
      "costo",
      "costi",
      "quanto costa",
      "preventivo",
      "budget",
      "tariffe",
      "quotazione",
    ],
  },
  {
    id: "tecnologie",
    titolo: "Tecnologie utilizzate",
    contenuto:
      "Stack moderno e collaudato: Next.js, React e TypeScript, Tailwind per lo stile, animazioni GSAP e 3D in WebGL, mappe MapLibre e funzioni AI server-side. Tutto orientato a performance, accessibilità e manutenibilità.",
    href: "/",
    tag: [
      "tecnologie",
      "stack",
      "tech",
      "next",
      "react",
      "typescript",
      "tailwind",
      "webgl",
      "framework",
      "come è fatto",
    ],
  },
  {
    id: "ai-privacy",
    titolo: "Come funziona l'AI (e la privacy)",
    contenuto:
      "Le funzioni AI girano lato server: le chiavi non raggiungono mai il browser. Quando manca una chiave, l'assistente usa un motore deterministico locale sui contenuti del sito, quindi resta utile e sicuro anche offline. Gli input degli utenti sono trattati come non fidati.",
    href: "/assistente",
    tag: [
      "privacy",
      "sicurezza",
      "ai",
      "chiave",
      "api key",
      "server",
      "dati",
      "gdpr",
      "offline",
      "fallback",
    ],
  },
  {
    id: "integrazione-sito",
    titolo: "Integrare l'assistente nel tuo sito",
    contenuto:
      "L'assistente è un componente autosufficiente: si monta una volta e dialoga con un endpoint server-side. Può vivere come riquadro nella pagina o come widget fluttuante globale, ereditando automaticamente il tema e i colori del sito.",
    href: "/assistente",
    tag: [
      "integrare",
      "integrazione",
      "widget",
      "embed",
      "montare",
      "componente",
      "installare",
      "aggiungere assistente",
    ],
  },
  {
    id: "accessibilita",
    titolo: "Accessibilità e performance",
    contenuto:
      "Costruiamo mobile-first e accessibile: rispetto di prefers-reduced-motion, contrasti adeguati, navigazione da tastiera e markup semantico. La performance viene prima dell'effetto, così tutto gira anche su dispositivi mid-range.",
    href: "/",
    tag: [
      "accessibilità",
      "performance",
      "velocità",
      "mobile",
      "responsive",
      "a11y",
      "tastiera",
      "lighthouse",
      "ottimizzazione",
    ],
  },
  {
    id: "contatti",
    titolo: "Parla con noi",
    contenuto:
      "Vuoi un preventivo o una demo dal vivo? Raccontaci l'obiettivo e ti proponiamo il servizio più adatto. Questa è una presentazione interattiva: i recapiti sono segnaposto, da sostituire con i tuoi al momento del deploy.",
    href: "/",
    tag: [
      "contatti",
      "contattare",
      "preventivo",
      "demo",
      "parlare",
      "email",
      "appuntamento",
      "richiesta",
      "scrivere",
    ],
  },
];

/** Insieme degli href ammessi: usato per scartare link inventati dal modello. */
export const KB_ALLOWED_HREFS: ReadonlySet<string> = new Set(KB.map((e) => e.href));
