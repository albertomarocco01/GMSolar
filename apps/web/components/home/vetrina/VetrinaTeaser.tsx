"use client";

/**
 * @descrizione  SNIPPET del sito vetrina — capitolo 02. Sostituisce il vecchio
 *   `BentoKit` (catalogo di componenti UI, fuori tema): qui si mostrano QUATTRO
 *   FRAMMENTI di un sito vetrina reale (modellati sulle sezioni di gmsolar.it:
 *   «Chi è GM Solar», i numeri, «Tipologia di impianti», «I nostri servizi»).
 *   Ogni frammento è una FINESTRA RITAGLIATA (`overflow-hidden` + contenuto
 *   volutamente più grande / traslato): la sezione esce dai bordi e non si vede
 *   mai per intero — sono assaggi, non pagine.
 *
 *   La VITA la mette la scena padre (InterfacceScene) allo scrub, via hook CSS:
 *     .vw-frag        → le 4 finestre che si aprono a wipe (maskReveal)
 *     .vw-f1-type     → headline «Cosa facciamo» che si digita (typeInField)
 *     .vw-f1-cta      → CTA «Scopri di più» premuta da sola (pressButton)
 *     .vw-stat        → i 4 numeri della sezione statistiche (countUp)
 *     .vw-f3-tile     → tile «Tipologia di impianti» scoperte a maschera
 *     .vw-f4-row      → righe dei servizi che entrano in cascata
 *   Solo markup + SVG inline: nessun asset raster, nessuna dipendenza.
 * @indice
 * - VetrinaTeaser → griglia dei 4 frammenti
 * - Window        → cornice-finestra ritagliata
 * - FragChiSiamo / FragNumeri / FragImpianti / FragServizi → i frammenti
 * - HatchTile     → tile placeholder (pattern SVG diagonale, nessuna foto reale)
 */
import { cn } from "@gmgroup/lib/utils";

/** Numeri della sezione statistiche: `to` lo consuma countUp nella scena. */
export const STATS = [
  { to: 20000, unit: "kWp", label: "Potenza installata" },
  { to: 45000, unit: "t", label: "CO₂ risparmiata" },
  { to: 85000, unit: "MW/h", label: "Energia prodotta" },
  { to: 300, unit: "", label: "Progetti realizzati" },
] as const;

const IMPIANTI = ["Residenziali", "Industriali C&I", "Solar Farm", "Revamping"];

const SERVIZI = [
  "Progettazione",
  "Installazione",
  "Monitoraggio",
  "Gestione amministrativa",
  "Consulenza",
  "Manutenzione O&M",
];

export default function VetrinaTeaser() {
  return (
    <div className="relative mx-auto w-full max-w-6xl">
      {/* Righe ad altezza FISSA: è il ritaglio a rendere i frammenti "parziali",
          quindi le finestre non si adattano al contenuto — lo tagliano. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[15rem_15rem]">
        <Window className="md:col-span-5">
          <FragChiSiamo />
        </Window>
        <Window className="md:col-span-7">
          <FragNumeri />
        </Window>
        <Window className="md:col-span-7">
          <FragImpianti />
        </Window>
        {/* Unico frammento su fondo ink: àncora di contrasto (il fondo scena
            resta chiaro). */}
        <Window dark className="md:col-span-5">
          <FragServizi />
        </Window>
      </div>
    </div>
  );
}

/* ---- Finestra: la cornice che RITAGLIA il frammento -----------------------
   `overflow-hidden` è il ritaglio; il clip-path di apertura lo anima la scena
   (maskReveal su .vw-frag). `dark` = frammento su fondo ink. */
function Window({
  dark,
  className,
  children,
}: {
  dark?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "vw-frag shadow-lift relative min-w-0 overflow-hidden rounded-2xl border",
        dark ? "bg-foreground border-white/10" : "bg-surface border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Overline delle sezioni chiare (stile "kicker" dei siti vetrina). */
function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-accent-ink font-mono text-[10px] font-semibold tracking-[0.24em] uppercase">
      {children}
    </p>
  );
}

/* ---- F1 · «Chi è GM Solar»: crop VERTICALE — la riga sopra l'overline è
   tagliata dal bordo alto (-mt-8). La headline si digita allo scrub. -------- */
function FragChiSiamo() {
  return (
    <div className="-mt-8 p-6">
      {/* riga fantasma: entra nel taglio superiore → la sezione "continua sopra" */}
      <span aria-hidden className="block h-3 w-28 rounded-full bg-black/10" />
      <div className="mt-6">
        <Overline>Chi è GM Solar</Overline>
        <h3 className="font-display text-foreground mt-2 overflow-hidden text-3xl font-bold tracking-tight">
          {/* whitespace-nowrap + inline-block: requisito di typeInField (clip-path) */}
          <span className="vw-f1-type inline-block whitespace-nowrap">Cosa facciamo</span>
        </h3>
      </div>
      {/* corpo del testo (righe placeholder) */}
      <div aria-hidden className="mt-4 space-y-2">
        <span className="block h-2 w-full rounded-full bg-black/8" />
        <span className="block h-2 w-11/12 rounded-full bg-black/8" />
        <span className="block h-2 w-3/4 rounded-full bg-black/8" />
      </div>
      <span className="vw-f1-cta bg-accent text-accent-contrast mt-5 inline-block rounded-full px-4 py-2 text-xs font-bold">
        Scopri di più
      </span>
    </div>
  );
}

/* ---- F2 · i NUMERI: griglia più larga della finestra (w-[126%]) → l'ultimo
   dato esce dal bordo destro. I valori contano allo scrub (countUp). ------- */
function FragNumeri() {
  return (
    <div className="p-6">
      <Overline>I nostri numeri</Overline>
      <div className="mt-6 grid w-[126%] grid-cols-4 gap-5">
        {STATS.map((s, i) => (
          <div key={s.label} className="min-w-0">
            <p className="font-display text-foreground text-3xl font-bold tracking-tight tabular-nums">
              {/* SSR mostra il valore finale; la scena lo azzera e lo conta. */}
              <span className={`vw-stat vw-stat-${i}`}>{s.to.toLocaleString("it-IT")}</span>
              {s.unit ? (
                <span className="text-accent-ink ml-1 text-base font-semibold">{s.unit}</span>
              ) : null}
            </p>
            <p className="text-muted mt-1 text-[10px] font-semibold tracking-wide uppercase">
              {s.label}
            </p>
            <span aria-hidden className="bg-accent mt-3 block h-0.5 w-8 rounded-full" />
          </div>
        ))}
      </div>
      {/* la sezione prosegue sotto: separatore + riga di testo tagliata */}
      <div aria-hidden className="border-border mt-6 border-t pt-4">
        <span className="block h-2 w-2/5 rounded-full bg-black/8" />
      </div>
    </div>
  );
}

/* ---- F3 · «Tipologia di impianti»: 4 tile, la quarta tagliata a destra.
   Si scoprono a maschera, in cascata. -------------------------------------- */
function FragImpianti() {
  return (
    <div className="p-6">
      <Overline>Tipologia di impianti</Overline>
      <div className="mt-4 grid w-[133%] grid-cols-4 gap-3">
        {IMPIANTI.map((t, i) => (
          <HatchTile key={t} i={i} label={t} />
        ))}
      </div>
    </div>
  );
}

/** Tile placeholder: pattern a righe diagonali in SVG (nessuna immagine reale,
 *  regola di progetto). `i` rende univoco l'id del pattern. */
function HatchTile({ i, label }: { i: number; label: string }) {
  const id = `vw-hatch-${i}`;
  return (
    <div className="vw-f3-tile border-border relative h-28 overflow-hidden rounded-xl border">
      <svg className="text-accent absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M-2 2 L2 -2 M0 10 L10 0 M8 12 L12 8" stroke="currentColor" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="currentColor" opacity="0.07" />
        <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.35" />
      </svg>
      <span className="bg-background/90 text-foreground absolute right-2 bottom-2 left-2 truncate rounded-lg px-2 py-1 text-[11px] font-semibold">
        {label}
      </span>
    </div>
  );
}

/* ---- F4 · «I nostri servizi» su fondo ink: l'elenco prosegue OLTRE il bordo
   basso della finestra (l'ultima voce è tagliata). Le righe entrano in cascata. */
function FragServizi() {
  return (
    <div className="p-6" aria-hidden>
      <p className="font-mono text-[10px] font-semibold tracking-[0.24em] text-white/50 uppercase">
        I nostri servizi
      </p>
      <ul className="mt-4 space-y-2.5">
        {SERVIZI.map((s) => (
          <li key={s} className="vw-f4-row flex items-center gap-2.5">
            <span className="bg-accent h-1.5 w-1.5 shrink-0 rounded-full" />
            <span className="text-sm font-medium text-white/90">{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
