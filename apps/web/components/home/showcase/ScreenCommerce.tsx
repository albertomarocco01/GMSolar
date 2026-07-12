/**
 * @descrizione  Schermata 02 della carrellata — PAGINA PRODOTTO e-commerce, tema
 *   CHIARO. UI densa: breadcrumb + carrello, galleria con thumbnail, blocco
 *   acquisto (titolo, stelle, prezzo con sconto, swatch colore, varianti,
 *   stepper quantità), CTA con sweep decorativo che allo scrub viene «premuta»
 *   (cursore finto → `.shw-s1-cta`) rivelando la conferma `.shw-s1-ok`, più due
 *   tile di garanzia. Animazione via classi `.shw-s1-*`, nessuno stato React.
 *
 *   Layer full-frame (`absolute inset-0`): la scena lo mostra/sfuma nel morph.
 */
const SWATCH = ["#3b4252", "#84cc16", "#e4e8ee", "#0ea5e9"] as const;

export default function ScreenCommerce() {
  return (
    <div className="shw-s1 text-foreground absolute inset-0 overflow-hidden bg-white">
      <div className="relative flex h-full flex-col gap-4 p-7">
        {/* Top bar */}
        <div className="shw-s1-item flex items-center justify-between">
          <p className="text-muted text-xs font-medium">
            Audio <span className="text-border">/</span> Cuffie{" "}
            <span className="text-border">/</span>{" "}
            <span className="text-foreground font-semibold">Aura Pro</span>
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted">Cerca</span>
            <span className="border-border relative rounded-full border px-3 py-1 font-semibold">
              Carrello
              <span className="bg-accent text-accent-contrast absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold">
                2
              </span>
            </span>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
          {/* Galleria */}
          <div className="flex min-h-0 flex-col gap-3">
            <div
              className="shw-s1-item shw-s1-hero relative min-h-0 flex-1 overflow-hidden rounded-2xl"
              style={{
                background:
                  "radial-gradient(120% 100% at 30% 15%, #f7fee7 0%, #eef2f7 45%, #d9f99d 120%)",
              }}
            >
              <span className="border-accent text-accent-ink absolute top-4 left-4 rounded-full border bg-white/70 px-3 py-1 text-[11px] font-bold">
                Novità
              </span>
              {/* Silhouette prodotto stilizzata */}
              <div className="absolute inset-0 grid place-items-center">
                <div className="h-40 w-40 rounded-[42%] border-[14px] border-[#1f2937]/85 shadow-[0_30px_60px_-20px_rgba(11,16,32,0.5)]" />
              </div>
            </div>
            <div className="shw-s1-item flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`aspect-square flex-1 rounded-xl ${
                    i === 0
                      ? "border-accent bg-brand-50 border-2"
                      : "border-border bg-surface border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Blocco acquisto */}
          <div className="flex flex-col gap-3">
            <div className="shw-s1-item">
              <h3 className="font-display text-2xl font-bold tracking-tight">Cuffie Aura Pro</h3>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="text-accent-ink tracking-tight">★★★★★</span>
                <span className="text-muted text-xs">4,8 · 214 recensioni</span>
              </div>
            </div>
            <div className="shw-s1-item flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold tracking-tight">€ 249</span>
              <span className="text-muted text-sm line-through">€ 329</span>
              <span className="bg-accent-soft text-accent-ink rounded-full px-2 py-0.5 text-xs font-bold">
                −24%
              </span>
            </div>
            <div className="shw-s1-item">
              <p className="text-muted mb-1.5 text-xs font-semibold">Colore: Grafite</p>
              <div className="flex gap-2">
                {SWATCH.map((c, i) => (
                  <span
                    key={c}
                    className={`h-7 w-7 rounded-full ring-offset-2 ${i === 0 ? "ring-accent ring-2" : "ring-border ring-1"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="shw-s1-item flex gap-2">
              {["Standard", "Pro", "Max"].map((v, i) => (
                <span
                  key={v}
                  className={`rounded-xl border px-4 py-1.5 text-sm font-semibold ${
                    i === 1
                      ? "border-accent bg-brand-50 text-accent-ink"
                      : "border-border text-muted"
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
            <div className="shw-s1-item flex items-center gap-3">
              <div className="border-border flex items-center gap-3 rounded-xl border px-3 py-1.5 text-sm font-bold">
                <span className="text-muted">−</span>
                <span className="tabular-nums">1</span>
                <span className="text-accent-ink">+</span>
              </div>
              <span className="text-brand-600 inline-flex items-center gap-1.5 text-xs font-semibold">
                <span className="bg-brand-500 h-1.5 w-1.5 rounded-full" /> Disponibile · 2-3 giorni
              </span>
            </div>
            <div className="shw-s1-item mt-1 flex items-center gap-3">
              <button
                type="button"
                className="shw-s1-cta bg-accent text-accent-contrast relative overflow-hidden rounded-xl px-6 py-3 text-sm font-bold shadow-[0_8px_24px_-8px_var(--accent)]"
              >
                <span
                  aria-hidden
                  className="shw-s1-shimmer pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent"
                />
                <span className="relative">Aggiungi al carrello</span>
              </button>
              <span
                className="shw-s1-ok text-brand-600 inline-flex items-center gap-1.5 text-sm font-bold"
                style={{ opacity: 0 }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current"
                  strokeWidth={3}
                >
                  <path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Aggiunto
              </span>
              <span className="border-border text-muted grid h-11 w-11 place-items-center rounded-xl border text-lg">
                ♡
              </span>
            </div>
            <div className="shw-s1-item mt-auto grid grid-cols-2 gap-2">
              {[
                ["Spedizione gratuita", "Consegna in 48h"],
                ["Garanzia 2 anni", "Reso entro 30 giorni"],
              ].map(([t, s]) => (
                <div key={t} className="border-border bg-surface rounded-xl border p-3">
                  <p className="text-xs font-bold">{t}</p>
                  <p className="text-muted text-[11px]">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
