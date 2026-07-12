"use client";

/**
 * @descrizione  QUADRO 1 — LANDING EDITORIALE di un installatore fotovoltaico
 *   (tema CHIARO). Archetipo "magazine premium" con INCASTRO MULTILAYER a
 *   profondità z (come i siti premium): almeno 3 livelli percepiti —
 *     · L0 (fondo)  : parola-GHOST gigante in outline accent (`.shw-q1-ghost`,
 *        aria-hidden, decorativa) — DIETRO headline e foto.
 *     · L10 (medio) : blocco editoriale — occhiello, HEADLINE display che si
 *        compone riga per riga (`.shw-q1-line`, maskReveal), LINEA accent che si
 *        traccia (`.shw-q1-rule`), testo, numeri, CTA (`.shw-q1-item`).
 *     · L20 (avanti): FOTO hero in cornice (`.shw-q1-photo`) che SORMONTA la coda
 *        della parola-ghost (la foto copre alcune lettere).
 *     · L30 (primo piano): BADGE stat che STRADDLE il bordo sinistro della foto
 *        (`.shw-q1-float`, col contatore `.shw-q1-count`).
 *   PROFONDITÀ IN MOVIMENTO: nei beat i layer derivano a velocità diverse
 *   (parallasse via transform, VALORI FISSI → scrub-safe) + gerarchia di
 *   scale/ombre. Nessuna misura runtime. Il testo dark resta AA leggibile; la
 *   parola-ghost è puro decoro (aria-hidden).
 *   In basso la STRISCIA CERTIFICAZIONI scorre lenta (marquee CSS, pausa/reduced-
 *   safe). Layer full-frame OPACO (`absolute inset-0`): la scena lo incrocia nei morph.
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
  { v: "12", suf: "", l: "anni di cantieri" },
  { v: "98", suf: "%", l: "clienti soddisfatti" },
] as const;

export default function QuadroLanding() {
  return (
    <div className="shw-q1 bg-background text-foreground absolute inset-0 overflow-hidden">
      {/* L0 — parola-ghost gigante DIETRO tutto (decorativa) */}
      <span
        aria-hidden
        className="shw-q1-ghost font-display pointer-events-none absolute top-[40%] left-5 z-0 -translate-y-1/2 text-[7.5rem] leading-none font-black tracking-tight whitespace-nowrap text-transparent"
        style={{ WebkitTextStroke: "1.5px color-mix(in oklab, var(--accent) 34%, transparent)" }}
      >
        fotovoltaico
      </span>

      {/* L10 — blocco editoriale (medio) */}
      <div className="relative z-10 flex h-full max-w-[58%] flex-col justify-center gap-6 py-10 pr-6 pl-9">
        <span className="shw-q1-item text-accent-ink text-xs font-bold tracking-[0.18em] uppercase">
          Installatori fotovoltaici · dal 2013
        </span>

        <h3 className="font-display text-[3.6rem] leading-[0.92] font-bold tracking-[-0.03em]">
          <span className="shw-q1-line block overflow-hidden">Energia pulita,</span>
          <span className="shw-q1-line block overflow-hidden">dal tetto</span>
          <span className="shw-q1-line block overflow-hidden">di casa tua.</span>
        </h3>

        {/* Linea accent sottile = innesco del filo conduttore (si traccia scaleX). */}
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
                {n.v}
                {n.suf}
              </p>
              <p className="text-muted mt-1 text-xs">{n.l}</p>
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

      {/* L20 — FOTO hero (avanti): sormonta la coda della parola-ghost */}
      <div className="shw-q1-photo absolute top-9 right-8 bottom-14 left-[53%] z-20 overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-30px_rgba(11,16,32,0.5)]">
        <img
          src="/assets/products/pannello-01.jpg"
          alt="Campo fotovoltaico a terra"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,16,32,0.45)] to-transparent" />
        <span className="absolute right-4 bottom-4 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-[#0b1020] backdrop-blur-sm">
          Parco a terra · 120 kWp
        </span>
      </div>

      {/* L30 — BADGE stat (primo piano): straddle sul bordo sinistro della foto */}
      <div className="shw-q1-float border-border absolute top-[24%] left-[47%] z-30 rounded-2xl border bg-white/95 px-4 py-3 shadow-[0_24px_50px_-20px_rgba(11,16,32,0.6)] backdrop-blur-sm">
        <p className="text-accent-ink font-display text-2xl font-bold tracking-tight tabular-nums">
          <span className="shw-q1-count">0</span>+
        </p>
        <p className="text-muted text-[11px] font-semibold">impianti installati</p>
      </div>

      {/* Striscia certificazioni: marquee lento (transform-only, pausa/reduced-safe) */}
      <div className="border-border absolute inset-x-0 bottom-0 z-40 overflow-hidden border-t bg-white/70">
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
