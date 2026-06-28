"use client";

/**
 * @descrizione  Scena immersiva ASSISTENTE AI (servizio 02). Full-screen, alta
 *   fedeltà: lo scroll scrubba un walkthrough — il visitatore apre la chat,
 *   pone una domanda in linguaggio naturale e l'assistente risponde indirizzando
 *   alla sezione giusta con una card-suggerimento. Il "sito vetrina" dietro fa
 *   un leggero pan verticale quando si naviga alla sezione suggerita.
 *   Frasi-intermezzo DESCRITTIVE (tono esplicativo, non promozionale).
 *   Usa il kit condiviso `./shared`. Reduced-motion: stato finale leggibile.
 */
import { gsap } from "@gmgroup/lib/gsap";
import { ImmersiveStage, Say, say, cursorTo, useImmersiveScene } from "./shared";

const SITE_NAV = ["Home", "Soluzioni", "Prodotti", "Chi siamo", "Contatti"];

const SITE_CARDS = [
  {
    t: "Fotovoltaico B2B",
    d: "Impianti chiavi in mano per capannoni e stabilimenti industriali.",
  },
  {
    t: "Wallbox flotte",
    d: "Gestione centralizzata della ricarica per flotte aziendali.",
  },
  {
    t: "Manutenzione",
    d: "Contratti di assistenza e monitoraggio remoto H24.",
  },
];

export default function ImmersiveAssistente() {
  const ref = useImmersiveScene((tl, _section) => {
    // ── Stato iniziale ────────────────────────────────────────────────────────
    // (gsap.context è già scoped alla section — i selettori sono isolati)
    gsap.set(".imm-panel", { autoAlpha: 0, scale: 0.82, transformOrigin: "100% 100%" });
    gsap.set(".imm-bubble-user", { autoAlpha: 0, x: 28 });
    gsap.set(".imm-typing", { autoAlpha: 0 });
    gsap.set(".imm-bubble-ai", { autoAlpha: 0, x: -28 });
    gsap.set(".imm-card-suggest", { autoAlpha: 0, y: 20 });
    gsap.set(".imm-chip", { autoAlpha: 0, scale: 0.78 });
    gsap.set(".imm-site-highlight", { opacity: 0 });
    tl.set(".imm-cursor", { left: "38%", top: "48%" });

    // ① Frase — presenta la scena: assistente integrato nel sito
    say(tl, 0);

    // ② Cursore va sul bottone chat → pannello si apre dall'angolo
    cursorTo(tl, "87%", "87%");
    tl.to(".imm-chat-btn", { scale: 0.9, duration: 0.14, ease: "power2.in" }, ">-0.05");
    tl.to(".imm-chat-btn", { scale: 1, duration: 0.22, ease: "back.out(2.5)" }, ">");
    tl.to(".imm-panel", {
      autoAlpha: 1,
      scale: 1,
      duration: 0.7,
      ease: "expo.out",
    });

    // ③ Bolla utente entra da destra + frase — comprende la domanda
    tl.to(".imm-bubble-user", {
      autoAlpha: 1,
      x: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    });
    say(tl, 1);

    // ④ Indicatore "sta scrivendo…" → sparisce → bolla AI + frase — indirizza
    tl.to(".imm-typing", { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    say(tl, 2);
    tl.to(".imm-typing", { autoAlpha: 0, duration: 0.22, ease: "power2.in" });
    tl.to(".imm-bubble-ai", {
      autoAlpha: 1,
      x: 0,
      duration: 0.55,
      ease: "back.out(1.6)",
    });

    // ⑤ Card-suggerimento + chip si costruiscono sotto la risposta
    tl.to(".imm-card-suggest", { autoAlpha: 1, y: 0, duration: 0.55, ease: "expo.out" }, ">0.18");
    tl.to(
      ".imm-chip",
      { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.13, ease: "back.out(1.9)" },
      ">0.1",
    );

    // ⑥ Cursore clicca il primo chip
    cursorTo(tl, "36%", "83%");
    tl.to(".imm-chip-1", { scale: 0.92, duration: 0.13, ease: "power2.in" }, ">-0.05");
    tl.to(".imm-chip-1", { scale: 1, duration: 0.2, ease: "back.out(2.2)" }, ">");

    // ⑦ Il sito dietro fa un pan verticale alla sezione suggerita + highlight
    tl.to(".imm-site-track", { yPercent: -38, duration: 1.3, ease: "expo.inOut" }, ">0.18");
    tl.to(".imm-site-highlight", { opacity: 1, duration: 0.5, ease: "power2.out" }, "<0.55");

    // Pausa finale
    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={420}
      theme="platform"
      label="Assistente"
      eyebrow="02 · Assistente AI di sito"
    >
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* ── Finto header del sito vetrina ──────────────────────────────── */}
        <header className="border-border bg-surface/90 relative z-10 flex h-14 shrink-0 items-center justify-between border-b px-6 backdrop-blur">
          <span className="font-display text-foreground text-base font-bold tracking-tight">
            GM Group
          </span>
          <nav className="hidden items-center gap-5 sm:flex" aria-hidden>
            {SITE_NAV.map((l) => (
              <span key={l} className="text-muted cursor-default text-sm">
                {l}
              </span>
            ))}
          </nav>
          <span className="bg-accent text-accent-contrast rounded-full px-4 py-1.5 text-xs font-semibold">
            Scopri di più
          </span>
        </header>

        {/* ── Corpo scrollabile del sito (pan via imm-site-track) ──────── */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Track animato: trasla verso l'alto per simulare lo scroll */}
          <div className="imm-site-track">
            {/* Hero del sito */}
            <div className="from-surface to-surface-2 flex min-h-[52vh] flex-col items-center justify-center bg-gradient-to-b px-6 py-20 text-center">
              <p className="text-muted mb-3 text-xs font-semibold tracking-widest uppercase">
                Energia · Mobilità · E-commerce
              </p>
              <h2 className="font-display text-foreground max-w-xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                L&apos;ecosistema digitale di GM&nbsp;Group
              </h2>
              <p className="text-muted mt-4 max-w-lg text-lg">
                Tre servizi integrati. Una sola piattaforma per gestirli.
              </p>
            </div>

            {/* Sezione "Soluzioni Aziende" — target del click sul chip */}
            <div className="border-border relative border-t px-8 py-14">
              {/* Highlight che si attiva quando il cursore clicca il chip */}
              <span
                className="imm-site-highlight border-accent bg-accent-soft pointer-events-none absolute inset-0 border-l-[3px]"
                aria-hidden
              />
              <p className="text-accent-ink mb-2 text-xs font-semibold tracking-widest uppercase">
                Soluzioni Aziende
              </p>
              <h3 className="text-foreground mb-6 text-2xl font-bold">
                Servizi su misura per le imprese
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {SITE_CARDS.map((c) => (
                  <div
                    key={c.t}
                    className="border-border bg-surface relative rounded-xl border p-5"
                  >
                    <p className="text-foreground font-semibold">{c.t}</p>
                    <p className="text-muted mt-1.5 text-sm leading-relaxed">{c.d}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Piè di sezione — spazio sufficiente per il pan */}
            <div className="border-border border-t px-8 py-20 text-center">
              <p className="text-muted text-sm">Prodotti · Contatti · Documentazione</p>
            </div>
          </div>

          {/* ── Bottone chat (toggle) ────────────────────────────────────── */}
          <button
            className="imm-chat-btn bg-accent text-accent-contrast absolute right-5 bottom-5 z-20 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
            tabIndex={-1}
            aria-hidden
          >
            {/* Icona messaggio */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* ── Pannello chat ─────────────────────────────────────────────── */}
          <div
            className="imm-panel border-border bg-background absolute right-5 bottom-24 z-20 flex w-[18.5rem] flex-col overflow-hidden rounded-2xl border shadow-2xl"
            style={{ maxHeight: "27rem" }}
            aria-hidden
          >
            {/* Testata pannello */}
            <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
              <span className="bg-accent text-accent-contrast flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                AI
              </span>
              <div className="min-w-0">
                <p className="text-foreground text-sm leading-tight font-semibold">Assistente GM</p>
                <p className="text-muted text-xs">Online</p>
              </div>
            </div>

            {/* Area messaggi */}
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
              {/* Messaggio di benvenuto (sempre visibile) */}
              <div className="max-w-[88%] self-start">
                <div className="bg-surface-2 text-foreground rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm leading-relaxed">
                  Ciao! Come posso aiutarti oggi?
                </div>
              </div>

              {/* Bolla utente — entra da destra */}
              <div className="imm-bubble-user max-w-[88%] self-end">
                <div className="bg-accent text-accent-contrast rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm leading-relaxed">
                  Avete soluzioni per le aziende?
                </div>
              </div>

              {/* Indicatore "sta scrivendo…" */}
              <div className="imm-typing max-w-[88%] self-start">
                <div className="bg-surface-2 flex items-center gap-1 rounded-2xl rounded-tl-sm px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="bg-muted h-1.5 w-1.5 animate-bounce rounded-full"
                      style={{ animationDelay: `${d * 0.16}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Bolla AI — entra da sinistra */}
              <div className="imm-bubble-ai max-w-[92%] self-start">
                <div className="bg-surface-2 text-foreground rounded-2xl rounded-tl-sm px-3.5 py-2 text-sm leading-relaxed">
                  Sì. GM Group offre impianti fotovoltaici B2B, wallbox per flotte aziendali e
                  contratti di manutenzione continuativa.
                </div>
              </div>

              {/* Card-suggerimento generata dall'AI */}
              <div className="imm-card-suggest self-start">
                <div className="border-border bg-background rounded-xl border p-3 text-sm">
                  <p className="text-foreground font-semibold">Soluzioni Aziende</p>
                  <p className="text-muted mt-0.5 text-xs leading-relaxed">
                    Impianti, flotte e manutenzione su misura.
                  </p>
                  <span className="bg-accent-soft text-accent-ink mt-2 block w-full rounded-lg py-1.5 text-center text-xs font-semibold">
                    Vai alla sezione
                  </span>
                </div>
              </div>

              {/* Chip di navigazione rapida */}
              <div className="flex flex-wrap gap-1.5 self-start pb-1">
                <span className="imm-chip imm-chip-1 border-accent bg-accent-soft text-accent-ink cursor-default rounded-full border px-3 py-1 text-xs font-semibold">
                  Fotovoltaico B2B
                </span>
                <span className="imm-chip border-border bg-surface text-muted cursor-default rounded-full border px-3 py-1 text-xs font-semibold">
                  Manutenzione
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Frasi-intermezzo DESCRITTIVE (tono esplicativo, non promozionale) ── */}
      <Say i={0}>Un assistente integrato nel sito risponde ai visitatori.</Say>
      <Say i={1}>Capisce la domanda in linguaggio naturale.</Say>
      <Say i={2}>Indirizza alla sezione o al prodotto giusto.</Say>
    </ImmersiveStage>
  );
}
