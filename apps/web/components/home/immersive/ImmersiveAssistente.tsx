"use client";

/**
 * @descrizione  Scena immersiva ASSISTENTE AI (capitolo 02, P12: si apre con la
 *   ChapterCard «02 · Assistente AI»; sotto reduced-motion un heading statico
 *   in cima supplisce alla card, nascosta a progress(1)). Full-screen, alta
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
 *   CAMERA (P11 — shot-list della scena): push-in (b) sulla barra durante il
 *   typing; punch (a) sull'invio; pull-back reveal (f) quando la griglia vola via
 *   ed entra la genui + rack focus (e) leggero sulla pagina dietro (`.imm-behind`);
 *   punch (a) sulla scelta del configuratore; cameraReset prima del beat finale
 *   → a progress(1) la camera è NEUTRA (reduced-motion pulito).
 *
 *   Usa il kit condiviso `./shared`; selettori a classe scoped a gsap.context.
 *   Reduced-motion: stato finale (interfaccia generata visibile, griglia nascosta)
 *   leggibile — il kit porta la timeline a progress(1).
 */
import { cn } from "@gmgroup/lib/utils";
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import {
  ImmersiveStage,
  Say,
  say,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  cursorTo,
  useImmersiveScene,
  pressButton,
  typeInField,
  drawPath,
  maskReveal,
  cameraTo,
  cameraReset,
  rackFocus,
  hideCursor,
} from "./shared";
import { PRODUCTS, GENERATED, QUERY } from "./_assistente-data";

const SHOP_NAV = ["Cavi", "Wallbox", "Adattatori", "Supporto"];

// Rating mock per card: varia leggermente così il catalogo non sembra copia-incolla.
const RATINGS = [
  { score: "4,8", count: "120+ recensioni" },
  { score: "4,7", count: "86 recensioni" },
  { score: "4,9", count: "210+ recensioni" },
  { score: "4,6", count: "54 recensioni" },
  { score: "4,8", count: "132 recensioni" },
  { score: "5,0", count: "41 recensioni" },
];

export default function ImmersiveAssistente() {
  // Reduced-motion: la timeline va a progress(1) → la ChapterCard finisce
  // nascosta. Serve un heading testuale statico del capitolo (vedi markup).
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl) => {
    // ── Stato iniziale (selettori scoped alla section da gsap.context) ─────────
    gsap.set(".imm-placeholder", { autoAlpha: 1 });
    gsap.set(".imm-bar-ring", { autoAlpha: 0 });
    gsap.set(".imm-typing", { autoAlpha: 0, y: 8 });
    // L'interfaccia generata parte nascosta e leggermente sotto/rimpicciolita.
    // (Le sue sezioni `.imm-genui-item` sono rivelate con maskReveal → restano a
    //  autoAlpha 1 ma clippate; il wipe le scopre.)
    gsap.set(".imm-genui", { autoAlpha: 0, y: 30, scale: 0.96, transformOrigin: "50% 60%" });

    // ① Title card di capitolo (P12): «02 · Assistente AI». PRIMO beat della
    //    timeline — prima dei beat camera (il primo è il push-in del beat ③).
    //    Sostituisce la vecchia <Say i={0}> col velo.
    chapterIntro(tl);

    // ② Il cursore (caret) tocca la barra → focus (anello accent)
    cursorTo(tl, ".imm-bar", { mode: "text" });
    tl.to(".imm-bar-ring", { autoAlpha: 1, duration: 0.35, ease: "power2.out" }, "<0.45");

    // ③ Digitazione della richiesta carattere-per-carattere (kit: typeInField).
    //    CAMERA · PUSH-IN (b): avvicinamento lento sulla barra per tutta la durata
    //    del typing (scale 1.2, ease "documentaristico"). La camera parte per prima
    //    e il typing si sovrappone: il cursore è già FERMO sulla barra (regola 2 ok,
    //    nessuna partenza simultanea camera+cursore). Sostituisce il vecchio
    //    clickZoom locale sulla barra (regola 4: i due punch non si sommano).
    tl.to(".imm-placeholder", { autoAlpha: 0, duration: 0.2, ease: "power2.in" });
    cameraTo(tl, ".imm-bar", { scale: 1.2, duration: 1.2, ease: "power1.inOut" });
    typeInField(tl, ".imm-typed", { steps: 30, duration: 1.2, position: "<0.1" });
    say(tl, 1);

    // ④ Invio → l'AI "ragiona": press del tasto (kit: pressButton), dots + un
    //    mini-grafico/spec che si DISEGNA durante la pausa di ragionamento.
    //    CAMERA · PUNCH (a) sul tasto invio: punch rapido (expo.out) + micro-
    //    overshoot d'arrivo (back.out) che assesta l'inquadratura a 1.4. Camera
    //    PRIMA, cursorTo per ULTIMO (regola 2: il cursore misura il layout ormai
    //    fermo → atterraggio preciso sul target inquadrato). L'inquadratura TIENE
    //    durante il ragionamento: il pull-back arriva col reveal della genui (⑤).
    cameraTo(tl, ".imm-send", { scale: 1.5, duration: 0.45, ease: "expo.out" });
    cameraTo(tl, ".imm-send", { scale: 1.4, duration: 0.25, ease: "back.out(1.2)" });
    cursorTo(tl, ".imm-send", { mode: "hand", duration: 0.6 });
    pressButton(tl, ".imm-send", {
      down: 0.86,
      downDur: 0.12,
      upDur: 0.22,
      back: 2.4,
      position: ">-0.05",
    });
    tl.to(".imm-typing", { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, ">0.1");
    drawPath(tl, ".imm-think-path", { duration: 0.7, ease: "power2.inOut", position: ">0.05" });
    tl.to({}, { duration: 0.4 }); // pausa: "sta ragionando"

    // ⑤ GENERA l'interfaccia: la griglia prodotti vola via e lascia il posto
    say(tl, 2);
    tl.to(".imm-typing", { autoAlpha: 0, y: 8, duration: 0.25, ease: "power2.in" });
    // La barra perde il focus: l'anello accent si spegne (altrimenti a progress(1),
    // sotto reduced-motion, resterebbe acceso senza interazione in corso).
    tl.to(".imm-bar-ring", { autoAlpha: 0, duration: 0.25, ease: "power2.in" }, "<");
    // CAMERA · PULL-BACK REVEAL (f): dall'inquadratura del punch (1.4) alla
    // neutra MENTRE la griglia vola via e la genui entra — è lo zoom-out che
    // "svela" l'interfaccia generata (chiude anche l'inquadratura del punch ④).
    cameraReset(tl, { duration: 1.1, ease: "power2.inOut" });
    // Il cursore finto vive FUORI dal layer .imm-camera: durante questo pull-back
    // di sola camera "galleggerebbe" staccato dai bottoni → lo sfumo via. Il
    // cursorTo del beat ⑥ (config-pick) lo rimostra da solo (autoAlpha 1).
    hideCursor(tl, { duration: 0.3 });
    // Griglia OUT: stagger che si dissolve verso l'alto, in overlap col pull-back.
    // autoAlpha:0 → visibility:hidden = fuori dall'albero a11y, ma il box resta
    // (height lock).
    tl.to(
      ".imm-prod",
      {
        autoAlpha: 0,
        y: -26,
        scale: 0.9,
        duration: 0.5,
        stagger: { each: 0.05, from: "end" },
        ease: "power2.in",
      },
      "<0.1",
    );
    // Interfaccia generata IN (overlay assoluto); le sezioni entrano con un WIPE
    // direzionale (kit: maskReveal) invece del semplice fade+slide.
    tl.to(
      ".imm-genui",
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.75, ease: "expo.out" },
      ">-0.15",
    );
    // CAMERA · RACK FOCUS (e) leggero: la pagina dietro la genui (header, titolo,
    // griglia ormai svuotata — classe `.imm-behind`) perde fuoco → profondità.
    // Resta così a fine scena: il primo piano non si richiude, quindi è uno stato
    // finale legittimo a progress(1) (la CAMERA invece torna comunque neutra).
    rackFocus(tl, ".imm-behind", { opacity: 0.7, scale: 0.99, position: "<" });
    maskReveal(tl, ".imm-genui-item", {
      dir: "l",
      duration: 0.5,
      stagger: 0.07,
      position: "<0.18",
    });

    // ⑥ Il configuratore "funziona": il cursore preme la combinazione pre-scelta.
    //    CAMERA · PUNCH (a) sulla scelta del configuratore: punch rapido + micro-
    //    overshoot d'arrivo; camera PRIMA, cursore per ULTIMO (regola 2).
    //    Sostituisce il clickZoom locale sul cluster del configuratore (regola 4).
    cameraTo(tl, ".imm-config-pick", { scale: 1.42, duration: 0.45, ease: "expo.out" });
    cameraTo(tl, ".imm-config-pick", { scale: 1.35, duration: 0.25, ease: "back.out(1.2)" });
    cursorTo(tl, ".imm-config-pick", { mode: "hand" });
    pressButton(tl, ".imm-config-pick", {
      down: 0.9,
      downDur: 0.1,
      upDur: 0.3,
      back: 2.6,
      position: ">-0.05",
    });
    tl.to({}, { duration: 0.35 }); // hold breve sull'inquadratura del click

    // ⑦ CAMERA · reset PRIMA del beat finale (regola 3): a progress(1) la camera
    //    è neutra → reduced-motion pulito e hand-off `.imm-stage` senza conflitti.
    cameraReset(tl);
    // Il cursore sfuma mentre la camera torna neutra e resta nascosto durante
    // l'hold finale e l'hand-off (a progress(1) neutro, reduced-motion pulito).
    hideCursor(tl, { duration: 0.3 });
    tl.to({}, { duration: 0.6 }); // pausa finale
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={520}
      theme="platform"
      label={CHAPTERS[1].title}
      chapterIndex={1}
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* ── Fallback reduced-motion: a progress(1) la ChapterCard è nascosta →
            heading statico del capitolo in cima alla scena (solo `reduced`,
            così lo scrub animato non ha elementi in più nel layout). ──────── */}
        {reduced && (
          <p className="border-border bg-surface text-accent-ink relative z-10 shrink-0 border-b px-6 py-2 font-mono text-xs font-semibold tracking-[0.3em] uppercase">
            {CHAPTERS[1].n} · {CHAPTERS[1].title}
          </p>
        )}
        {/* ── Header della pagina prodotti (sito vetrina / e-commerce) ──────
            `.imm-behind` = pagina DIETRO la genui (header, titolo, griglia):
            perde fuoco col rack focus quando l'interfaccia generata entra. */}
        <header className="imm-behind border-border bg-surface/90 relative z-10 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="bg-accent h-4 w-4 rounded-[5px]" aria-hidden />
            <span className="font-display text-foreground text-base font-bold tracking-tight">
              GM Solar Shop
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
        <div className="imm-behind px-6 pt-4">
          <h2 className="font-display text-foreground text-lg font-bold tracking-tight">
            Cavi di ricarica
          </h2>
          <p className="text-muted mt-0.5 text-xs">Trova il cavo giusto per la tua auto.</p>
        </div>

        <div className="imm-grid imm-behind grid grid-cols-2 content-start gap-3 overflow-hidden px-6 pt-3 pb-44 sm:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <article
              key={p.id}
              className="imm-prod border-border bg-surface relative flex flex-col overflow-hidden rounded-xl border"
            >
              {/* Area visiva: foto prodotto placeholder (royalty-free, tema
                  ricarica EV) — decorativa (alt="") con badge in overlay. */}
              <div className="relative h-24 overflow-hidden">
                <img
                  src={`/assets/products/cavo-0${i + 1}.jpg`}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  decoding="async"
                  className="h-24 w-full object-cover"
                />
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
                {/* Rating (mock statico) — credibilità e-commerce. */}
                <div className="mt-1.5 flex items-center gap-1 text-[0.62rem]">
                  <StarIcon className="text-accent-ink h-3 w-3" />
                  <span className="text-foreground font-semibold">
                    {RATINGS[i % RATINGS.length].score}
                  </span>
                  <span className="text-muted">· {RATINGS[i % RATINGS.length].count}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Chip>{p.phase}</Chip>
                  <Chip>{p.shape}</Chip>
                </div>
                <p className="text-foreground mt-auto pt-2 text-sm font-bold">{p.price}</p>
              </div>
            </article>
          ))}
        </div>

        {/* ── Indicatore "sta ragionando…" (sopra la barra): dots + un mini-spec
            che si DISEGNA durante la pausa di ragionamento (imm-think-path) ── */}
        <div className="imm-typing absolute bottom-28 left-1/2 z-10 -translate-x-1/2" aria-hidden>
          <div className="bg-surface-2 border-border flex items-center gap-2.5 rounded-full border px-4 py-3 shadow-lg">
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="bg-muted h-1.5 w-1.5 animate-bounce rounded-full"
                  style={{ animationDelay: `${d * 0.16}s` }}
                />
              ))}
            </span>
            <span className="bg-border h-4 w-px" />
            <span className="text-muted text-[10px] font-semibold tracking-wide">
              Genero l&apos;interfaccia
            </span>
            <svg viewBox="0 0 72 24" className="text-accent-ink h-5 w-16" fill="none" aria-hidden>
              <path
                className="imm-think-path"
                d="M2 20 L14 12 L26 15 L38 6 L50 10 L70 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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

            {/* Corpo della vista generata. overflow-y-auto: su viewport bassi
                (landscape/zoom) prezzo e CTA in fondo restano raggiungibili invece
                di essere clippati (era overflow-hidden). */}
            <div className="border-border bg-background grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto rounded-2xl border p-4 shadow-2xl sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:p-5">
              {/* Colonna visiva: foto prodotto placeholder (wallbox a muro) +
                  gallery di 4 thumbnail (foto già usate nelle card, crop quadrato);
                  la thumbnail attiva (indice 0) conserva l'anello accent.
                  Decorativa: il contenitore è già aria-hidden. */}
              <div className="imm-genui-item flex min-h-0 flex-col gap-2.5" aria-hidden>
                <div className="h-24 overflow-hidden rounded-xl sm:h-auto sm:flex-1">
                  <img
                    src="/assets/products/cavo-01.jpg"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden grid-cols-4 gap-2 sm:grid">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-11 overflow-hidden rounded-lg border",
                        i === 0 ? "border-accent ring-accent-ring ring-2" : "border-border",
                      )}
                    >
                      <img
                        src={`/assets/products/cavo-0${i + 1}.jpg`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
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

                {/* Configuratore (mock): l'AI ha pre-selezionato la combinazione.
                    `.imm-config-pick` = la scelta che il cursore "preme" (prima
                    opzione selezionata); il punch è DI CAMERA (P11), non locale. */}
                <div className="mt-3 space-y-2">
                  {GENERATED.options.map((opt, oi) => (
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
                              oi === 0 && i === opt.selected && "imm-config-pick",
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

      {/* ── Title card di capitolo (apre la scena) + caption descrittive ──── */}
      <ChapterCard chapter={CHAPTERS[1]} subtitle="Un assistente AI dentro il sito vetrina." />
      <Say i={1} variant="caption">
        Capisce la richiesta in linguaggio naturale.
      </Say>
      <Say i={2} variant="caption">
        E genera al volo l&apos;interfaccia su misura.
      </Say>
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

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 18.9 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" />
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
