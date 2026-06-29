"use client";

/**
 * @descrizione  Scena immersiva ASSISTENTE AI (servizio 02). Full-screen, alta
 *   fedeltà: lo scroll scrubba un walkthrough che riprende il legacy
 *   `CableFinder` — una PAGINA PRODOTTI (cavi di ricarica) con in basso una
 *   BARRA ASSISTENTE. Il cursore tocca la barra, il visitatore digita una
 *   richiesta in linguaggio naturale, l'AI "ragiona" un istante e poi GENERA
 *   l'interfaccia del risultato: una card-raccomandazione (look di
 *   `CableRecommendation`) col prodotto giusto evidenziato nella griglia +
 *   motivazione breve. Frasi-intermezzo DESCRITTIVE (tono esplicativo).
 *   Usa il kit condiviso `./shared`; selettori a classe scoped a gsap.context.
 *   Reduced-motion: stato finale (card generata visibile) leggibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, cursorTo, clickZoom, useImmersiveScene } from "./shared";
import { PRODUCTS, RECOMMENDATION, QUERY } from "./_assistente-data";

const SHOP_NAV = ["Cavi", "Wallbox", "Adattatori", "Supporto"];

export default function ImmersiveAssistente() {
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale (selettori scoped alla section da gsap.context) ─────────
    gsap.set(".imm-placeholder", { autoAlpha: 1 });
    gsap.set(".imm-typed", { clipPath: "inset(0 100% 0 0)" });
    gsap.set(".imm-bar-ring", { autoAlpha: 0 });
    gsap.set(".imm-typing", { autoAlpha: 0, y: 8 });
    gsap.set(".imm-reco", { autoAlpha: 0, y: 44, scale: 0.92, transformOrigin: "50% 100%" });
    gsap.set(".imm-reco-item", { autoAlpha: 0, y: 14 });
    gsap.set(".imm-match-ring", { autoAlpha: 0, scale: 1.06 });
    tl.set(".imm-cursor", { left: "50%", top: "52%" });

    // ① Presenta la scena: un assistente dentro la pagina prodotti
    say(tl, 0);

    // ② Il cursore (caret) tocca la barra → focus (anello accent)
    cursorTo(tl, ".imm-bar", { mode: "text" });
    tl.to(".imm-bar-ring", { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, "<0.45");

    // ③ Digitazione della richiesta (placeholder esce, testo rivelato a "steps")
    tl.to(".imm-placeholder", { autoAlpha: 0, duration: 0.2, ease: "power2.in" });
    tl.to(".imm-typed", { clipPath: "inset(0 0% 0 0)", duration: 1.2, ease: "steps(30)" });
    clickZoom(tl, ".imm-bar", { position: "<" }); // punch-zoom della barra durante il typing
    say(tl, 1);

    // ④ Invio → l'AI "ragiona" (cursore-mano sul tasto, press, typing dots)
    cursorTo(tl, ".imm-send", { mode: "hand" });
    tl.to(".imm-send", { scale: 0.86, duration: 0.12, ease: "power2.in" }, ">-0.05");
    tl.to(".imm-send", { scale: 1, duration: 0.22, ease: "back.out(2.4)" }, ">");
    tl.to(".imm-typing", { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, ">0.1");
    tl.to({}, { duration: 0.55 }); // pausa: "sta ragionando"

    // ⑤ Genera l'interfaccia del risultato
    say(tl, 2);
    tl.to(".imm-typing", { autoAlpha: 0, y: 8, duration: 0.25, ease: "power2.in" });

    // ⑥ Card-raccomandazione che entra + highlight del prodotto giusto in griglia
    tl.to(".imm-reco", { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: "expo.out" });
    tl.to(".imm-prod-rest", { opacity: 0.4, duration: 0.55, ease: "power2.out" }, "<");
    tl.to(
      ".imm-match-ring",
      { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)" },
      "<0.1",
    );
    tl.to(
      ".imm-reco-item",
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
      "<0.1",
    );

    // ⑦ Pausa finale
    tl.to({}, { duration: 0.7 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={440}
      theme="platform"
      label="Assistente"
      eyebrow="02 · Assistente AI di prodotto"
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* ── Header della pagina prodotti (sito vetrina / e-commerce) ────── */}
        <header className="border-border bg-surface/90 relative z-10 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="bg-accent h-4 w-4 rounded-[5px]" aria-hidden />
            <span className="font-display text-foreground text-base font-bold tracking-tight">
              Cavo Perfetto
            </span>
          </div>
          <nav className="hidden items-center gap-5 sm:flex" aria-hidden>
            {SHOP_NAV.map((l) => (
              <span key={l} className="text-muted cursor-default text-sm">
                {l}
              </span>
            ))}
          </nav>
          <span className="bg-surface-2 text-muted rounded-full px-3 py-1 text-xs font-semibold">
            Carrello · 0
          </span>
        </header>

        {/* ── Corpo: titolo + griglia prodotti ───────────────────────────── */}
        <div className="px-6 pt-4">
          <h2 className="font-display text-foreground text-lg font-bold tracking-tight">
            Cavi di ricarica
          </h2>
          <p className="text-muted mt-0.5 text-xs">Trova il cavo giusto per la tua auto.</p>
        </div>

        <div className="imm-grid grid grid-cols-2 content-start gap-3 overflow-hidden px-6 pt-3 pb-44 sm:grid-cols-3">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className={`border-border bg-surface relative flex flex-col overflow-hidden rounded-xl border ${
                p.recommended ? "imm-prod-match" : "imm-prod-rest"
              }`}
            >
              {/* Anello highlight: si accende quando l'AI sceglie questo prodotto */}
              {p.recommended && (
                <span
                  className="imm-match-ring border-accent pointer-events-none absolute -inset-px z-10 rounded-xl border-2"
                  aria-hidden
                />
              )}
              <div className="bg-surface-2 relative flex h-16 items-center justify-center">
                <PlugIcon className="text-muted h-7 w-7" />
                {p.bestSeller && (
                  <span className="bg-accent text-accent-contrast absolute top-2 left-2 rounded-full px-2 py-0.5 text-[0.6rem] font-bold">
                    Best seller
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3">
                <p className="text-foreground line-clamp-2 text-xs leading-snug font-semibold">
                  {p.name}
                </p>
                <p className="text-muted mt-1 text-[0.65rem]">{p.use}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Chip>{p.phase}</Chip>
                  <Chip>{p.shape}</Chip>
                </div>
                <p className="text-foreground mt-auto pt-2 text-sm font-bold">{p.price}</p>
              </div>
            </article>
          ))}
        </div>

        {/* ── Indicatore "sta ragionando…" (sopra la barra, dove apparirà la card) ── */}
        <div className="imm-typing absolute bottom-28 left-1/2 z-10 -translate-x-1/2" aria-hidden>
          <div className="bg-surface-2 border-border flex items-center gap-1 rounded-full border px-4 py-3 shadow-lg">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="bg-muted h-1.5 w-1.5 animate-bounce rounded-full"
                style={{ animationDelay: `${d * 0.16}s` }}
              />
            ))}
          </div>
        </div>

        {/* ── Card-raccomandazione GENERATA dall'AI (look di CableRecommendation) ── */}
        <div className="imm-reco absolute inset-x-0 bottom-24 z-10 px-5" aria-hidden>
          <div className="mx-auto max-w-md">
            <p className="imm-reco-item text-muted mb-2 px-1 text-center text-xs">
              {RECOMMENDATION.lead}
            </p>
            <div className="border-border bg-background overflow-hidden rounded-2xl border shadow-2xl">
              <div className="grid grid-cols-[6rem_1fr]">
                {/* Immagine prodotto (placeholder tematizzato) */}
                <div className="bg-accent-soft flex items-center justify-center">
                  <PlugIcon className="text-accent-ink h-9 w-9" />
                </div>
                <div className="min-w-0 p-4">
                  <p className="imm-reco-item text-accent-ink text-[0.65rem] font-semibold tracking-widest uppercase">
                    Consigliato · generato dall&apos;AI
                  </p>
                  <h4 className="imm-reco-item font-display text-foreground mt-1 text-sm leading-snug font-semibold text-balance">
                    {RECOMMENDATION.name}
                  </h4>
                  <div className="imm-reco-item mt-2 flex flex-wrap gap-1.5">
                    {RECOMMENDATION.badges.map((b, i) => (
                      <span
                        key={b}
                        className={
                          i === 0
                            ? "bg-accent text-accent-contrast rounded-full px-2 py-0.5 text-[0.65rem] font-semibold"
                            : "bg-surface-2 text-muted rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
                        }
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {RECOMMENDATION.reasons.map((r) => (
                      <li
                        key={r}
                        className="imm-reco-item text-foreground/90 flex items-start gap-2 text-xs"
                      >
                        <CheckIcon className="text-accent-ink mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="leading-snug">{r}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="imm-reco-item mt-3 flex items-center justify-between">
                    <span className="text-foreground text-base font-bold tracking-tight">
                      {RECOMMENDATION.price}
                    </span>
                    <span className="bg-accent text-accent-contrast rounded-full px-3 py-1.5 text-xs font-semibold">
                      Vai al prodotto
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Barra assistente AI (in basso) ─────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-5" aria-hidden>
          <div className="imm-bar border-border bg-background/95 relative mx-auto flex max-w-2xl items-center gap-3 rounded-full border px-4 py-2.5 shadow-lg backdrop-blur">
            <span className="imm-bar-ring border-accent pointer-events-none absolute -inset-px rounded-full border-2" />
            <span className="bg-accent text-accent-contrast flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              AI
            </span>
            <div className="relative flex h-7 min-w-0 flex-1 items-center overflow-hidden text-sm">
              <span className="imm-placeholder text-muted absolute left-0 whitespace-nowrap">
                Chiedi all&apos;assistente…
              </span>
              <span className="imm-typed text-foreground absolute left-0 whitespace-nowrap">
                {QUERY}
              </span>
            </div>
            <span className="imm-send bg-accent text-accent-contrast flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <SendIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>

      {/* ── Frasi-intermezzo DESCRITTIVE (spiegano, non vendono) ──────────── */}
      <Say i={0}>Un assistente AI dentro il sito vetrina.</Say>
      <Say i={1}>Capisce la richiesta in linguaggio naturale.</Say>
      <Say i={2}>Genera al volo l&apos;interfaccia con il prodotto giusto.</Say>
    </ImmersiveStage>
  );
}

/* ── Sotto-componenti / icone ─────────────────────────────────────────────── */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-surface-2 text-muted rounded-full px-2 py-0.5 text-[0.6rem] font-medium">
      {children}
    </span>
  );
}

function PlugIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9 2v4M15 2v4" />
      <path d="M6 6h12v4a6 6 0 0 1-12 0V6Z" />
      <path d="M12 16v6" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 12l16-8-6 16-2.5-6.5L4 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
