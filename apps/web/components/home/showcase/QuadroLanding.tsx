"use client";

/**
 * @descrizione  QUADRO 1 — LANDING EDITORIALE di un installatore fotovoltaico
 *   (tema CHIARO). Archetipo "magazine": molto bianco, gerarchia tipografica
 *   FORTE, NIENTE card. Split asimmetrico: a sinistra un occhiello, una headline
 *   display GIGANTE che si COMPONE riga per riga (`.shw-q1-line`, maskReveal), una
 *   sottile LINEA accent che si traccia (`.shw-q1-rule`) = innesco del filo
 *   conduttore "beam", numeri di fiducia in linea (`.shw-q1-item`, uno con countUp
 *   `.shw-q1-count`) e la CTA; a destra una grande FOTO del campo fotovoltaico
 *   (`.shw-q1-photo`, `pannello-01` = campo pannelli a terra). In basso una
 *   STRISCIA CERTIFICAZIONI che scorre lenta (marquee CSS `shwMarquee`, pausa- e
 *   reduced-safe). Layer full-frame OPACO (`absolute inset-0`): la scena lo
 *   incrocia in opacity nei morph (vira del fondo del device).
 */
const CERT = [
  "IEC 61215",
  "IEC 61730",
  "CEI 0-21",
  "ISO 9001",
  "Moduli Tier 1",
  "Garanzia 25 anni",
  "Posa certificata",
  "Superbonus",
] as const;

const NUM = [
  { k: "shw-q1-count", v: "0", suf: "+", l: "impianti installati" },
  { k: "", v: "12", suf: "", l: "anni di cantieri" },
  { k: "", v: "98", suf: "%", l: "clienti soddisfatti" },
] as const;

export default function QuadroLanding() {
  return (
    <div className="shw-q1 bg-background text-foreground absolute inset-0 overflow-hidden">
      <div className="grid h-full grid-cols-[1.05fr_0.95fr]">
        {/* Colonna testo (editoriale) */}
        <div className="flex flex-col justify-center gap-5 py-10 pr-8 pl-9">
          <span className="shw-q1-item text-accent-ink text-xs font-bold tracking-[0.18em] uppercase">
            Installatori fotovoltaici · dal 2013
          </span>

          <h3 className="font-display text-[3.1rem] leading-[0.94] font-bold tracking-[-0.03em]">
            <span className="shw-q1-line block overflow-hidden">Energia pulita,</span>
            <span className="shw-q1-line block overflow-hidden">dal tetto</span>
            <span className="shw-q1-line block overflow-hidden">di casa tua.</span>
          </h3>

          {/* Linea accent sottile = innesco del beam (si traccia scaleX). */}
          <span
            className="shw-q1-rule bg-accent h-[3px] w-40 rounded-full"
            style={{ transformOrigin: "left", transform: "scaleX(0)" }}
          />

          <p className="shw-q1-item text-muted max-w-md text-[0.95rem] leading-relaxed">
            Progettiamo, installiamo e monitoriamo impianti su misura. Un unico interlocutore dal
            sopralluogo all&apos;allaccio in rete.
          </p>

          {/* Numeri di fiducia IN LINEA (niente card) */}
          <div className="shw-q1-item flex gap-8">
            {NUM.map((n) => (
              <div key={n.l}>
                <p className="font-display text-2xl font-bold tracking-tight tabular-nums">
                  <span className={n.k}>{n.v}</span>
                  {n.suf}
                </p>
                <p className="text-muted mt-0.5 text-xs">{n.l}</p>
              </div>
            ))}
          </div>

          <div className="shw-q1-item flex items-center gap-3 pt-1">
            <span className="bg-accent text-accent-contrast rounded-full px-6 py-3 text-sm font-bold shadow-[0_10px_28px_-10px_var(--accent)]">
              Richiedi un sopralluogo
            </span>
            <span className="text-foreground border-border rounded-full border px-5 py-3 text-sm font-semibold">
              Come lavoriamo
            </span>
          </div>
        </div>

        {/* Colonna foto (grande, editoriale) */}
        <div className="relative py-8 pr-9">
          <div className="shw-q1-photo relative h-full overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-30px_rgba(11,16,32,0.5)]">
            <img
              src="/assets/products/pannello-01.jpg"
              alt="Campo fotovoltaico a terra"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,16,32,0.45)] to-transparent" />
            <span className="absolute bottom-5 left-5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-[#0b1020] backdrop-blur-sm">
              Parco a terra · 120 kWp
            </span>
          </div>
        </div>
      </div>

      {/* Striscia certificazioni: marquee lento (transform-only, pausa/reduced-safe) */}
      <div className="border-border absolute inset-x-0 bottom-0 overflow-hidden border-t bg-white/70">
        <div className="shw-q1-marquee flex w-max items-center gap-10 py-3 pl-10">
          {[...CERT, ...CERT].map((c, i) => (
            <span
              key={i}
              className="text-muted flex shrink-0 items-center gap-2 text-xs font-semibold tracking-wide"
            >
              <span className="bg-accent inline-block h-1.5 w-1.5 rounded-full" />
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
