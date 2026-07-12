"use client";

/**
 * @descrizione  QUADRO 3 — PREVENTIVATORE A WIZARD (tema MID: slate/grigio medio,
 *   contrasto AA curato). Archetipo "app/product funnel" ARMONIZZATO: UNA card
 *   centrale, UNA scala di spacing (ritmo 16·24 tra le sezioni, gap 12 nelle
 *   griglie), radii coerenti (card 1.75rem · sotto-superfici rounded-2xl = 16 ·
 *   pill rounded-full), 3 livelli tipografici (titolo display · testo sm · label
 *   xs). Meccaniche invariate: SLIDER superficie tetto trascinato (`.shw-q3-knob`
 *   x + `.shw-q3-fill` scaleX, larghezza FISSA 420px; m² a rullo `.shw-q3-m2`),
 *   TOGGLE batteria (`.shw-q3-knob-b` + `.shw-q3-on`), 3 RADIO-CARD taglia
 *   (`.shw-q3-radio` ring sulla scelta).
 *
 *   EFFETTO PER-ELEMENTO — la CARD PREZZO (prezzo + CTA) è avvolta da
 *   <ElectricBorder/>: bordo elettrico canvas sul suo perimetro. La CTA con shine
 *   MORPHa label→spinner→check (`.shw-q3-label`/`.shw-q3-spin`/`.shw-q3-check`).
 *   Layer full-frame OPACO (`absolute inset-0`): la scena lo incrocia nei morph.
 */
import ElectricBorder from "./ElectricBorder";

const TAGLIE = [
  { p: "3 kWp", s: "monofamiliare", e: "€ 5.400" },
  { p: "6 kWp", s: "consigliata", e: "€ 8.900" },
  { p: "9 kWp", s: "con accumulo", e: "€ 12.700" },
] as const;

export default function QuadroPreventivo() {
  return (
    <div
      className="shw-q3 absolute inset-0 grid place-items-center overflow-hidden bg-[#3b4453] text-white"
      data-quadro="3"
    >
      <div className="shw-q3-card w-[620px] max-w-[92%] rounded-[1.75rem] bg-[#464f5e] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
        {/* Passi */}
        <div className="shw-q3-item flex items-center justify-between text-[11px] font-semibold text-white/55">
          <div className="flex items-center gap-2">
            {["Superficie", "Configura", "Preventivo"].map((s, i) => (
              <span
                key={s}
                className={
                  i === 1
                    ? "bg-accent text-accent-contrast rounded-full px-2.5 py-1"
                    : "rounded-full bg-white/10 px-2.5 py-1"
                }
              >
                {s}
              </span>
            ))}
          </div>
          <span>Passo 2 di 3</span>
        </div>

        <h3 className="shw-q3-item font-display mt-6 text-2xl font-bold tracking-tight">
          Configura il tuo impianto
        </h3>

        {/* Slider superficie — meccanica invariata (larghezza fissa 420px) */}
        <div className="shw-q3-item mt-6">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-white/70">Superficie del tetto</span>
            <span className="font-display font-bold tabular-nums">
              <span className="shw-q3-m2">0</span> m²
            </span>
          </div>
          <div className="relative mt-3 h-2 w-[420px] max-w-full rounded-full bg-white/12">
            <div
              className="shw-q3-fill bg-accent h-full w-[420px] max-w-full rounded-full"
              style={{ transformOrigin: "left", transform: "scaleX(0.16)" }}
            />
            <span className="shw-q3-knob bg-accent-contrast absolute top-1/2 left-[59px] h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />
          </div>
        </div>

        {/* Toggle batteria */}
        <div className="shw-q3-item mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Aggiungi accumulo</p>
            <p className="mt-0.5 text-xs text-white/50">Batteria 5 kWh · più autoconsumo</p>
          </div>
          <span className="relative h-6 w-11 rounded-full bg-white/15">
            <span
              className="shw-q3-on bg-accent absolute inset-0 rounded-full"
              style={{ opacity: 0 }}
            />
            <span className="shw-q3-knob-b absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow" />
          </span>
        </div>

        {/* Taglie — 3 radio-card uniformi (gap 12) */}
        <div className="shw-q3-item mt-4 grid grid-cols-3 gap-3">
          {TAGLIE.map((t, i) => (
            <div key={t.p} className="relative rounded-2xl border border-white/12 bg-[#3a4250] p-3">
              {i === 1 ? (
                <span
                  className="shw-q3-radio ring-accent pointer-events-none absolute inset-0 rounded-2xl ring-2"
                  style={{ opacity: 0 }}
                />
              ) : null}
              <p className="font-display text-lg font-bold">{t.p}</p>
              <p className="mt-0.5 text-[11px] text-white/50">{t.s}</p>
              <p className="text-accent mt-2 text-sm font-bold tabular-nums">{t.e}</p>
            </div>
          ))}
        </div>

        {/* CARD PREZZO — effetto per-elemento: bordo elettrico canvas (radius 16). */}
        <ElectricBorder radius={16} className="shw-q3-item mt-6">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#3a4250] p-4">
            <div>
              <p className="text-xs text-white/50">Prezzo stimato</p>
              <p className="font-display text-3xl leading-none font-bold tracking-tight tabular-nums">
                € <span className="shw-q3-price">0</span>
              </p>
            </div>
            <button
              type="button"
              className="shw-q3-cta bg-accent text-accent-contrast relative grid h-12 min-w-[220px] place-items-center overflow-hidden rounded-xl px-6 text-sm font-bold shadow-[0_10px_28px_-10px_var(--accent)]"
            >
              <span
                aria-hidden
                className="shw-q3-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
              />
              <span className="shw-q3-label relative">Richiedi il preventivo</span>
              <span
                className="shw-q3-spin absolute inset-0 grid place-items-center"
                style={{ opacity: 0 }}
              >
                <span className="shw-spinner border-accent-contrast/30 border-t-accent-contrast h-6 w-6 rounded-full border-[3px]" />
              </span>
              <span
                className="shw-q3-check absolute inset-0 flex items-center justify-center gap-2"
                style={{ opacity: 0 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current"
                  strokeWidth={3}
                >
                  <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Richiesta inviata
              </span>
            </button>
          </div>
        </ElectricBorder>
      </div>
    </div>
  );
}
