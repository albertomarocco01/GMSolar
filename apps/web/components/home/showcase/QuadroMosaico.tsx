"use client";

/**
 * @descrizione  QUADRO 4 — CATALOGO / PORTFOLIO a MOSAICO (tema CHIARO).
 *   Archetipo "bento/masonry ASIMMETRICO": celle di taglie diverse (foto progetti
 *   + tile prodotto + una cella «richiedi sopralluogo»). Le celle si rivelano a
 *   MASCHERA in cascata (`.shw-q4-cell`, maskReveal stagger). Attorno all'INTERO
 *   mosaico gira il BEAM (<ElectricBeam radius=24/>) che a fine giro "chiude" il
 *   capitolo; il suo bordo acceso statico è lo STATO FINALE leggibile
 *   (progress(1)/reduced-motion).
 *
 *   FOTO — solo asset esistenti, ogni label combacia col contenuto REALE:
 *     pannello-01 = campo pannelli a terra · inverter-01 = TETTO fotovoltaico
 *     (nome file fuorviante!) · wallbox-detail = wallbox · cavo-03 = cavo ·
 *     cavo-06 = colonnina di ricarica.
 *   Layer full-frame OPACO (`absolute inset-0`): la scena lo incrocia nei morph.
 */
import ElectricBeam from "./ElectricBeam";

/** Cella foto con etichetta in basso (verifica label↔contenuto nel @descrizione). */
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

/** Tile prodotto: foto + nome + prezzo (catalogo componenti). */
function Prodotto({
  src,
  alt,
  nome,
  prezzo,
  span,
}: {
  src: string;
  alt: string;
  nome: string;
  prezzo: string;
  span: string;
}) {
  return (
    <div
      className={`shw-q4-cell border-border flex flex-col overflow-hidden rounded-2xl border bg-white ${span}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="min-h-0 w-full flex-1 object-cover"
      />
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-foreground text-xs font-semibold">{nome}</p>
        <p className="text-accent-ink text-xs font-bold">{prezzo}</p>
      </div>
    </div>
  );
}

export default function QuadroMosaico() {
  return (
    <div className="shw-q4 bg-background absolute inset-0 overflow-hidden p-5">
      {/* Cornice del mosaico: il beam gira sull'INTERO perimetro (chiusura capitolo). */}
      <div className="relative h-full rounded-[1.5rem]">
        <ElectricBeam radius={24} duration={5.2} length={130} />

        <div className="grid h-full grid-cols-4 grid-rows-3 gap-3 p-3">
          {/* Campo pannelli a terra (grande) */}
          <Foto
            src="/assets/products/pannello-01.jpg"
            alt="Campo fotovoltaico a terra"
            label="Parco a terra · 120 kWp"
            span="col-span-2 row-span-2"
          />
          {/* TETTO fotovoltaico (nome file 'inverter' fuorviante) */}
          <Foto
            src="/assets/products/inverter-01.jpg"
            alt="Impianto fotovoltaico su tetto"
            label="Impianto su tetto · 9,8 kWp"
            span="col-span-2 row-span-1"
          />
          {/* Wallbox */}
          <Prodotto
            src="/assets/products/wallbox-detail.jpg"
            alt="Wallbox per ricarica"
            nome="Wallbox 22 kW"
            prezzo="€ 899"
            span="col-span-1 row-span-1"
          />
          {/* Colonnina di ricarica */}
          <Prodotto
            src="/assets/products/cavo-06.jpg"
            alt="Colonnina di ricarica"
            nome="Colonnina DC"
            prezzo="€ 1.190"
            span="col-span-1 row-span-1"
          />
          {/* Cavo Type 2 */}
          <Prodotto
            src="/assets/products/cavo-03.jpg"
            alt="Cavo di ricarica Type 2"
            nome="Cavo Type 2 · 5 m"
            prezzo="€ 149"
            span="col-span-2 row-span-1"
          />
          {/* Cella CTA (niente foto) */}
          <div className="shw-q4-cell bg-accent text-accent-contrast col-span-2 row-span-1 flex items-center justify-between rounded-2xl px-5 py-4">
            <div>
              <p className="font-display text-base font-bold tracking-tight">
                Richiedi un sopralluogo
              </p>
              <p className="text-accent-contrast/70 text-xs font-semibold">
                Preventivo gratuito in 48h
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/25 text-lg font-bold">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
