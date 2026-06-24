import Container from "@gmgroup/ui/Container";
import Button from "@gmgroup/ui/Button";
import ScrollReveal from "@gmgroup/ui/ScrollReveal";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import { Check } from "lucide-react";

/**
 * Hero della sezione Shop (Cavo Perfetto) — "studio energetico" scuro.
 *
 * È l'UNICA superficie scura del sito shop (forzata, indipendente dallo schema
 * OS): qui il lime acido del brand ha finalmente alto contrasto e "canta".
 * Una lastra tecnica del connettore Tipo 2 con un impulso di energia che
 * percorre il cavo (l'unico loop del sito). Tutto CSS/SVG: nessuna foto finta,
 * zero CLS (min-h riservata). Resta un Server Component: il motion arriva da
 * SplitTextReveal/ScrollReveal (reduced-motion safe) e l'impulso è una keyframe
 * locale che la regola globale prefers-reduced-motion congela da sola.
 */

// Keyframe locale (NON tocca la zona condivisa globals.css). Un punto luminoso
// percorre il path del cavo via stroke-dashoffset (path normalizzato a 100).
// `to` si ferma a -96 (non a -100 = periodo del dash): così con reduced-motion,
// quando la regola globale congela l'animazione all'ultimo keyframe, il punto
// resta SUL path (in fondo al cavo) e visibile, senza dipendere dal wrapping al
// bordo esatto del periodo. Da acceso, il punto "scorre" lungo il cavo.
const HERO_CSS = `
.cp-pulse{stroke-dasharray:4 96;stroke-dashoffset:0;animation:cp-pulse 2.6s linear infinite;filter:drop-shadow(0 0 5px var(--accent));}
@keyframes cp-pulse{to{stroke-dashoffset:-96;}}
`;

const TRUST = ["Spedizioni gratuite", "Reso facile", "Garanzia fino a 56 mesi"];

export default function ShopHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0a0c10] text-[#eef1f6]">
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

      {/* Bagliore accent dietro la lastra. */}
      <div
        aria-hidden
        className="absolute top-1/2 right-0 -z-10 h-[70vh] w-[70vh] max-w-[680px] -translate-y-1/2 translate-x-1/4 rounded-full bg-[radial-gradient(circle,var(--accent),transparent_70%)] opacity-20 blur-3xl"
      />

      <Container className="flex min-h-[80svh] flex-col justify-center pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Masthead editoriale. */}
        <div className="mb-10 flex items-baseline justify-between border-b border-white/10 pb-4">
          <span className="text-xs tracking-[0.3em] text-white/55 uppercase">Cavo Perfetto</span>
          <span className="hidden text-xs tracking-widest text-white/55 sm:inline">
            Rivendita autorizzata Mennekes
          </span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* Tipografia */}
          <div className="lg:col-span-7">
            <p className="text-accent flex items-center gap-3 text-xs font-semibold tracking-[0.25em] uppercase">
              <span className="bg-accent h-px w-6" aria-hidden />
              01 — Ricarica
            </p>

            <SplitTextReveal
              as="h1"
              by="word"
              text="Ricarica, ovunque."
              className="font-display text-display-md md:text-display-lg mt-5 font-bold tracking-tight text-balance"
            />

            <ScrollReveal stagger={0.08} y={16}>
              <p className="mt-6 max-w-lg text-lg text-white/70">
                Cavi di ricarica Mennekes per ogni auto e ogni colonnina. Non sai quale serve a te?
                L&apos;assistente lo trova in trenta secondi.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="#cable-finder" size="lg">
                  Trova il tuo cavo
                </Button>
                <Button
                  href="#catalogo"
                  variant="outline"
                  size="lg"
                  className="border-white/25 text-white hover:bg-white/10"
                >
                  Sfoglia il catalogo
                </Button>
              </div>

              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/55">
                {TRUST.map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="text-accent h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          {/* Motivo: lastra del connettore Tipo 2 con impulso di energia. */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[280px] lg:max-w-none">
              {/* Carta da progetto, sfuma nel buio. */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_28px),repeating-linear-gradient(90deg,#fff_0_1px,transparent_1px_28px)] opacity-[0.06] mask-[radial-gradient(ellipse_at_center,black,transparent_72%)]"
              />

              <svg
                viewBox="0 0 320 360"
                fill="none"
                className="relative w-full text-white/55"
                aria-hidden
              >
                <rect x="14" y="14" width="292" height="332" rx="26" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="160" cy="150" r="104" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />

                {/* 7 pin (Tipo 2). Il pin in alto è l'ancora cromatica accent. */}
                <circle cx="160" cy="96" r="11" className="fill-accent" />
                <circle cx="122" cy="120" r="14" fill="currentColor" />
                <circle cx="198" cy="120" r="14" fill="currentColor" />
                <circle cx="110" cy="158" r="14" fill="currentColor" />
                <circle cx="210" cy="158" r="14" fill="currentColor" />
                <circle cx="138" cy="196" r="16" fill="currentColor" />
                <circle cx="182" cy="196" r="16" fill="currentColor" />

                {/* Cavo statico + impulso che lo percorre. */}
                <path
                  d="M160 256C160 300 160 300 160 340"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  className="cp-pulse stroke-accent"
                  d="M160 256C160 300 160 300 160 340"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  pathLength={100}
                />
              </svg>

              <p className="mt-3 text-right text-[11px] tracking-wide text-white/45">
                Fig. 1 — Connettore Tipo 2 (IEC 62196)
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Cucitura inferiore: la "linea di energia" prosegue nel catalogo chiaro. */}
      <div
        aria-hidden
        className="via-accent/40 absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent to-transparent"
      />
    </section>
  );
}
