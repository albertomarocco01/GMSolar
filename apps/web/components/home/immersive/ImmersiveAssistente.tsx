"use client";

/**
 * @descrizione  Scena immersiva ASSISTENTE AI (servizio 02). Full-screen, alta
 *   fedeltà: lo scroll scrubba un walkthrough che riprende il legacy
 *   `CableFinder` — una PAGINA PRODOTTI (cavi di ricarica) con in basso una
 *   BARRA ASSISTENTE. Il cursore tocca la barra, il visitatore digita una
 *   richiesta in linguaggio naturale, l'AI "ragiona" un istante e poi
 *   GENERA L'INTERA INTERFACCIA: la griglia prodotti VOLA VIA (stagger) e al suo
 *   posto entra una VISTA DETTAGLIO/CONFIGURATORE su misura del prodotto giusto —
 *   non un semplice riassunto. Frasi-intermezzo DESCRITTIVE (tono esplicativo).
 *
 *   Una sola sorgente di verità: la fase (griglia → uscita → generata) è derivata
 *   dalla timeline scrubbata (niente stato React che litiga con lo scroll). La
 *   griglia esce via `autoAlpha` → `visibility:hidden`: sparisce dall'albero di
 *   accessibilità MA conserva il suo box → l'altezza della scena non cambia e lo
 *   sticky-scrub non si desincronizza. L'interfaccia generata è un overlay assoluto.
 *
 *   Usa il kit condiviso `./shared`; selettori a classe scoped a gsap.context.
 *   Reduced-motion: stato finale (interfaccia generata visibile, griglia nascosta)
 *   leggibile — il kit porta la timeline a progress(1).
 */
import { cn } from "@gmgroup/lib/utils";
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, cursorTo, clickZoom, useImmersiveScene } from "./shared";
import { PRODUCTS, GENERATED, QUERY } from "./_assistente-data";

const SHOP_NAV = ["Cavi", "Wallbox", "Adattatori", "Supporto"];

export default function ImmersiveAssistente() {
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale (selettori scoped alla section da gsap.context) ─────────
    gsap.set(".imm-placeholder", { autoAlpha: 1 });
    gsap.set(".imm-typed", { clipPath: "inset(0 100% 0 0)" });
    gsap.set(".imm-bar-ring", { autoAlpha: 0 });
    gsap.set(".imm-typing", { autoAlpha: 0, y: 8 });
    // L'interfaccia generata parte nascosta e leggermente sotto/rimpicciolita.
    gsap.set(".imm-genui", { autoAlpha: 0, y: 30, scale: 0.96, transformOrigin: "50% 60%" });
    gsap.set(".imm-genui-item", { autoAlpha: 0, y: 14 });
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

    // ⑤ GENERA l'interfaccia: la griglia prodotti vola via e lascia il posto
    say(tl, 2);
    tl.to(".imm-typing", { autoAlpha: 0, y: 8, duration: 0.25, ease: "power2.in" });
    // Griglia OUT: stagger che si dissolve verso l'alto. autoAlpha:0 →
    // visibility:hidden = fuori dall'albero a11y, ma il box resta (height lock).
    tl.to(".imm-prod", {
      autoAlpha: 0,
      y: -26,
      scale: 0.9,
      duration: 0.5,
      stagger: { each: 0.05, from: "end" },
      ease: "power2.in",
    });
    // Interfaccia generata IN (overlay assoluto) + contenuti in cascata.
    tl.to(".imm-genui", { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: "expo.out" }, ">-0.15");
    tl.to(
      ".imm-genui-item",
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.4)" },
      "<0.18",
    );

    // ⑥ Pausa finale
    tl.to({}, { duration: 0.7 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={460}
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
              className="imm-prod border-border bg-surface relative flex flex-col overflow-hidden rounded-xl border"
            >
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

        {/* ── Indicatore "sta ragionando…" (sopra la barra) ──────────────── */}
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

        {/* ── INTERFACCIA GENERATA dall'AI: vista dettaglio + configuratore ──
            Overlay assoluto (la griglia sotto conserva il box → altezza scena
            stabile). Parte nascosta; entra quando l'assistente "genera". */}
        <div
          className="imm-genui absolute inset-x-0 top-30 bottom-23 z-10 px-5 sm:top-21"
          style={{ opacity: 0 }}
        >
          <div className="mx-auto flex h-full max-w-3xl flex-col">
            {/* Etichetta "generato dall'AI" */}
            <div className="imm-genui-item mb-2.5 flex items-center gap-2">
              <SparkIcon className="text-accent-ink h-4 w-4" />
              <p className="text-accent-ink text-xs font-semibold tracking-widest uppercase">
                {GENERATED.eyebrow}
              </p>
            </div>

            {/* Corpo della vista generata */}
            <div className="border-border bg-background grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden rounded-2xl border p-4 shadow-2xl sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:p-5">
              {/* Colonna visiva: immagine prodotto + gallery (decorativa) */}
              <div className="imm-genui-item flex min-h-0 flex-col gap-2.5" aria-hidden>
                <div className="bg-accent-soft flex h-24 items-center justify-center rounded-xl sm:h-auto sm:flex-1">
                  <PlugIcon className="text-accent-ink h-14 w-14" />
                </div>
                <div className="hidden grid-cols-4 gap-2 sm:grid">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-lg border",
                        i === 0 ? "border-accent bg-accent-soft" : "border-border bg-surface-2",
                      )}
                    >
                      <PlugIcon className="text-muted h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Colonna dettaglio: titolo, badge, configuratore, motivi, prezzo */}
              <div className="flex min-w-0 flex-col">
                <h3 className="imm-genui-item font-display text-foreground text-base leading-snug font-bold tracking-tight text-balance sm:text-lg">
                  {GENERATED.title}
                </h3>
                <div className="imm-genui-item mt-2 flex flex-wrap gap-1.5">
                  {GENERATED.badges.map((b, i) => (
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

                {/* Configuratore (mock): l'AI ha pre-selezionato la combinazione */}
                <div className="mt-3 space-y-2">
                  {GENERATED.options.map((opt) => (
                    <div key={opt.label} className="imm-genui-item">
                      <p className="text-muted text-[0.65rem] font-medium">{opt.label}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5" aria-hidden>
                        {opt.values.map((v, i) => (
                          <span
                            key={v}
                            className={cn(
                              "rounded-lg border px-2.5 py-1 text-xs",
                              i === opt.selected
                                ? "border-accent bg-accent-soft text-accent-ink font-semibold"
                                : "border-border text-muted",
                            )}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Motivi «perché questo» */}
                <ul className="mt-3 hidden space-y-1.5 sm:block">
                  {GENERATED.reasons.map((r) => (
                    <li
                      key={r}
                      className="imm-genui-item text-foreground/90 flex items-start gap-2 text-xs"
                    >
                      <CheckIcon className="text-accent-ink mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="leading-snug">{r}</span>
                    </li>
                  ))}
                </ul>

                {/* Prezzo + CTA */}
                <div className="imm-genui-item mt-auto flex items-center justify-between pt-3">
                  <span className="text-foreground text-xl font-bold tracking-tight">
                    {GENERATED.price}
                  </span>
                  <span className="bg-accent text-accent-contrast rounded-full px-4 py-2 text-sm font-semibold">
                    {GENERATED.cta}
                  </span>
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
      <Say i={2}>E genera al volo l&apos;interfaccia su misura.</Say>
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

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l1.8 4.9L18.7 9.7l-4.9 1.8L12 16.4l-1.8-4.9L5.3 9.7l4.9-1.8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}
