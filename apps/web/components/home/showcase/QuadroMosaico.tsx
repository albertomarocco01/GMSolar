"use client";

/**
 * @descrizione  QUADRO 4 — CATALOGO / PORTFOLIO a MOSAICO (tema CHIARO).
 *   Archetipo "bento ARMONIZZATO": UNA griglia 4×2, UNO spacing (gap 12, padding
 *   24), radii coerenti (celle rounded-2xl = 16). NIENTE beam sul perimetro del
 *   modulo (rimosso): la profondità viene da un INCASTRO multilayer MODERATO —
 *   una card «featured» che SORMONTA la griglia (layer z più avanti, con ombra).
 *   Le celle si rivelano a MASCHERA in cascata (`.shw-q4-cell`, maskReveal stagger).
 *
 *   PROPORZIONI (feedback): le CARD PRODOTTO sono RETTANGOLI VERTICALI con area
 *   IMMAGINE ~quadrata (image flex-1 in cella portrait 1×1); le due FOTO progetto
 *   stanno su celle larghe 2×1 orientate come l'immagine (niente strisce basse).
 *
 *   FOTO — solo asset esistenti, ogni label combacia col contenuto REALE:
 *     pannello-01 = campo pannelli a terra · inverter-01 = TETTO fotovoltaico
 *     (nome file fuorviante!) · wallbox-detail = wallbox · cavo-03 = cavo ·
 *     cavo-06 = colonnina di ricarica.
 *   Layer full-frame OPACO (`absolute inset-0`): la scena lo incrocia nei morph.
 */

/** Cella FOTO progetto (larga): immagine + etichetta in basso. */
function Foto({
  src,
  alt,
  label,
  span,
}: {
  src: string;
  alt: string;
  label: string;
  span: string;
}) {
  return (
    <div className={`shw-q4-cell relative overflow-hidden rounded-2xl ${span}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,16,32,0.5)] to-transparent" />
      <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#0b1020] backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}

/** Card PRODOTTO PORTRAIT: area immagine ~quadrata sopra (flex-1), nome+prezzo sotto. */
function Prodotto({
  src,
  alt,
  nome,
  prezzo,
}: {
  src: string;
  alt: string;
  nome: string;
  prezzo: string;
}) {
  return (
    <div className="shw-q4-cell border-border flex flex-col overflow-hidden rounded-2xl border bg-white">
      <div className="relative min-h-0 flex-1">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <p className="text-foreground text-xs font-semibold">{nome}</p>
        <p className="text-accent-ink text-sm font-bold tabular-nums">{prezzo}</p>
      </div>
    </div>
  );
}

export default function QuadroMosaico() {
  return (
    <div className="shw-q4 bg-background absolute inset-0 overflow-hidden p-6" data-quadro="4">
      <div className="relative h-full">
        <div className="grid h-full grid-cols-4 grid-rows-2 gap-3">
          {/* Row 1 — campo pannelli (largo) + 2 card prodotto portrait */}
          <Foto
            src="/assets/products/pannello-01.jpg"
            alt="Campo fotovoltaico a terra"
            label="Parco a terra · 120 kWp"
            span="col-span-2"
          />
          <Prodotto
            src="/assets/products/wallbox-detail.jpg"
            alt="Wallbox per ricarica"
            nome="Wallbox 22 kW"
            prezzo="€ 899"
          />
          <Prodotto
            src="/assets/products/cavo-06.jpg"
            alt="Colonnina di ricarica"
            nome="Colonnina DC"
            prezzo="€ 1.190"
          />

          {/* Row 2 — tetto FV (largo) + 1 card prodotto portrait + CTA portrait */}
          <Foto
            src="/assets/products/inverter-01.jpg"
            alt="Impianto fotovoltaico su tetto"
            label="Impianto su tetto · 9,8 kWp"
            span="col-span-2"
          />
          <Prodotto
            src="/assets/products/cavo-03.jpg"
            alt="Cavo di ricarica Type 2"
            nome="Cavo Type 2 · 5 m"
            prezzo="€ 149"
          />
          <div className="shw-q4-cell bg-accent text-accent-contrast flex flex-col justify-between rounded-2xl p-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/25 text-lg font-bold">
              →
            </span>
            <div>
              <p className="font-display text-base leading-tight font-bold tracking-tight">
                Richiedi un sopralluogo
              </p>
              <p className="text-accent-contrast/70 mt-1 text-[11px] font-semibold">
                Preventivo gratuito in 48h
              </p>
            </div>
          </div>
        </div>

        {/* INCASTRO multilayer MODERATO: card «featured» che SORMONTA la griglia
            (layer z avanti, ombra) — straddle sulla cucitura campo/tetto a sinistra.
            NON è una `.shw-q4-cell`: compare con l'autoAlpha del quadro (no clip). */}
        <div className="border-border pointer-events-none absolute top-1/2 left-5 z-30 -translate-y-1/2 rounded-2xl border bg-white/95 px-4 py-3 shadow-[0_24px_50px_-20px_rgba(11,16,32,0.6)] backdrop-blur-sm">
          <p className="text-accent-ink font-display text-2xl font-bold tracking-tight tabular-nums">
            250+
          </p>
          <p className="text-muted text-[11px] font-semibold">impianti a portfolio</p>
        </div>
      </div>
    </div>
  );
}
