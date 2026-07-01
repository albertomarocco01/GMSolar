"use client";

/**
 * @descrizione  Scena immersiva INTEGRAZIONI (07 · Integrazioni). Tema CHIARO,
 *   tono DESCRITTIVO. Un MURO DI LOGHI dei sistemi collegabili, ora INTERATTIVO:
 *   ① entrano 6 tile "in vetrina"; ② «e molti altri» rivela le restanti in
 *   cascata; ③ una barra di ricerca scrive una query («pagamenti», kit:
 *   typeInField) che FILTRA il muro (le non-pertinenti sfumano, le pertinenti
 *   risaltano + badge); ④ il cursore apre il DETTAGLIO di un'integrazione
 *   (cursorTo + clickZoom). Le icone sono loghi brand reali da `simple-icons`,
 *   resi nel colore ufficiale del brand dentro tile neutre (token).
 *
 *   La sequenza si CHIUDE ripristinando la griglia piena e pulita (filtro
 *   azzerato, dettaglio chiuso, ricerca vuota) → così lo stato finale è un muro
 *   completo e leggibile, corretto anche in reduced-motion (il kit porta la
 *   timeline a progress(1)). Il float continuo, sfalsato e indipendente dallo
 *   scroll, parte SOLO se l'utente non ha richiesto meno movimento.
 *
 * Usa il kit condiviso `./shared`.
 */
import { cn } from "@gmgroup/lib/utils";
import { gsap } from "@gmgroup/lib/gsap";
import {
  siAirtable,
  siDiscord,
  siGmail,
  siGooglecalendar,
  siGooglesheets,
  siHubspot,
  siInstagram,
  siMailchimp,
  siMeta,
  siNotion,
  siPaypal,
  siShopify,
  siStripe,
  siTelegram,
  siTrello,
  siWhatsapp,
  siWoocommerce,
  siZapier,
} from "simple-icons";
import {
  ImmersiveStage,
  Say,
  say,
  cursorTo,
  clickZoom,
  useImmersiveScene,
  typeInField,
} from "./shared";

// ─── Dati statici ────────────────────────────────────────────────────────────

/** Forma minima di un'icona di `simple-icons` usata da questa scena. */
type BrandIcon = { path: string; hex: string; title: string };

/** Tile del muro: logo + categoria (serve al filtro della ricerca). */
type Tile = { icon: BrandIcon; cat: string };

/**
 * Il "muro" di integrazioni. I PRIMI 6 sono "in vetrina" (entrano per primi);
 * le due voci "Pagamenti" (Stripe, PayPal) sono il match della query «pagamenti».
 */
const TILES: Tile[] = [
  { icon: siWhatsapp, cat: "Messaggistica" },
  { icon: siGmail, cat: "Email" },
  { icon: siStripe, cat: "Pagamenti" },
  { icon: siShopify, cat: "E-commerce" },
  { icon: siGooglesheets, cat: "Documenti" },
  { icon: siHubspot, cat: "CRM" },
  { icon: siTelegram, cat: "Messaggistica" },
  { icon: siInstagram, cat: "Social" },
  { icon: siMeta, cat: "Social" },
  { icon: siDiscord, cat: "Messaggistica" },
  { icon: siGooglecalendar, cat: "Documenti" },
  { icon: siNotion, cat: "Documenti" },
  { icon: siTrello, cat: "Documenti" },
  { icon: siAirtable, cat: "Documenti" },
  { icon: siPaypal, cat: "Pagamenti" },
  { icon: siWoocommerce, cat: "E-commerce" },
  { icon: siMailchimp, cat: "Marketing" },
  { icon: siZapier, cat: "Automazione" },
];

/** Integrazione aperta al click (mock deterministico): Stripe · Pagamenti. */
const DETAIL = {
  icon: siStripe,
  cat: "Pagamenti",
  caps: ["Incassi", "Abbonamenti", "Fatture"],
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function ImmersiveIntegrazioni() {
  const ref = useImmersiveScene((tl, section) => {
    // Rispettiamo la preferenza di sistema senza dipendenze esterne: il float
    // continuo (loop infinito, fuori dallo scroll) parte solo se NON ridotto.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Le tile sono elementi reali → le animo per riferimento (no selettori
    // scoped) così l'entrata a ondate e il filtro possono partizionarle.
    const tiles = Array.from(section.querySelectorAll<HTMLElement>(".imm-tile"));
    const featured = tiles.slice(0, 6);
    const rest = tiles.slice(6);
    const matches = Array.from(section.querySelectorAll<HTMLElement>(".imm-tile-pay"));
    const nonMatches = tiles.filter((t) => !matches.includes(t));

    // ── Stato iniziale: tile rimpicciolite/invisibili; ricerca e dettaglio spenti ──
    gsap.set(tiles, { scale: 0.6, autoAlpha: 0 });
    gsap.set(".imm-int-badge", { autoAlpha: 0, scale: 0.8 });
    gsap.set(".imm-int-detail", { autoAlpha: 0, scale: 0.9, y: 8, transformOrigin: "50% 50%" });
    tl.set(".imm-cursor", { left: "50%", top: "18%" });

    // ── ① Le prime 6 tile "in vetrina" entrano (scale + autoAlpha, rimbalzo) ──
    say(tl, 0); // «Ci integriamo con i sistemi che usi ogni giorno.»
    tl.to(featured, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.5,
      stagger: { each: 0.06, from: "start" },
      ease: "back.out(1.8)",
    });

    // ── ② «e molti altri» → il resto del muro entra in cascata ───────────────
    say(tl, 1); // «…e con molti altri.»
    tl.to(rest, {
      scale: 1,
      autoAlpha: 1,
      duration: 0.5,
      stagger: { each: 0.035, from: "start" },
      ease: "back.out(1.7)",
    });

    // ── ③ Ricerca: il cursore scrive una query (typeInField) e il muro FILTRA ──
    say(tl, 2); // «Cerca quello che ti serve: l'elenco si filtra.»
    cursorTo(tl, ".imm-int-search", { mode: "text" });
    tl.to(".imm-int-placeholder", { autoAlpha: 0, duration: 0.2, ease: "power2.in" });
    typeInField(tl, ".imm-int-query", { steps: 12, duration: 0.7 });
    clickZoom(tl, ".imm-int-search", { position: "<0.2" }); // punch-zoom della barra durante il typing
    // Le non-pertinenti sfumano; le pertinenti (Pagamenti) risaltano + badge.
    tl.to(nonMatches, { autoAlpha: 0.18, duration: 0.5, ease: "power2.out" }, ">0.05");
    tl.to(matches, { scale: 1.1, duration: 0.4, ease: "back.out(2)" }, "<");
    tl.to(".imm-int-badge", { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, "<");

    // ── ④ Il cursore apre il DETTAGLIO dell'integrazione ─────────────────────
    say(tl, 3); // «Un click e la colleghi.»
    cursorTo(tl, ".imm-int-open", { mode: "hand" });
    // Punch inline che torna a 1.1 (la scala del filtro ancora attivo): clickZoom
    // finirebbe a scale 1 e la tile cliccata resterebbe più PICCOLA di PayPal
    // finché il filtro non si azzera al beat ⑤.
    tl.set(".imm-int-open", { transformOrigin: "50% 50%", willChange: "transform" }, ">-0.05");
    tl.to(".imm-int-open", { scale: 1.26, duration: 0.28, ease: "power2.out" });
    tl.to(".imm-int-open", { scale: 1.1, duration: 0.34, ease: "power2.inOut" });
    tl.to(
      ".imm-int-detail",
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" },
      ">-0.1",
    );
    tl.to({}, { duration: 0.5 });

    // ── ⑤ Chiusura: dettaglio chiuso + filtro azzerato → griglia piena e pulita
    //     (stato finale leggibile anche in reduced-motion, che salta a progress(1)). ──
    tl.to(".imm-int-detail", { autoAlpha: 0, scale: 0.9, y: 8, duration: 0.3, ease: "power2.in" });
    tl.to(nonMatches, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, "<");
    tl.to(matches, { scale: 1, duration: 0.3, ease: "power2.out" }, "<");
    tl.to(".imm-int-badge", { autoAlpha: 0, duration: 0.3 }, "<");
    tl.to(
      ".imm-int-query",
      { clipPath: "inset(0 100% 0 0)", duration: 0.3, ease: "power2.in" },
      "<",
    );
    tl.to(".imm-int-placeholder", { autoAlpha: 1, duration: 0.3 }, "<");
    tl.to({}, { duration: 0.4 });

    // ── Float continuo sfalsato (motion-safe, indipendente dallo scroll) ─────
    // Anima SOLO `y`: entrata (scale/autoAlpha) e filtro (autoAlpha) usano altre
    // proprietà, quindi le animazioni non si sovrascrivono.
    if (!reduced) {
      tiles.forEach((tile, i) => {
        gsap.to(tile, {
          y: "-=8",
          duration: 1.6 + (i % 5) * 0.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: (i % 6) * 0.18,
        });
      });
    }
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={520}
      theme="platform"
      label="Integrazioni"
      eyebrow="07 · Integrazioni"
    >
      <div className="relative flex h-full flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* Barra di ricerca: la query si "scrive" (clip-path) e filtra il muro */}
        <div className="mb-8 w-full max-w-md" aria-hidden>
          <div className="imm-int-search border-border bg-surface flex h-11 items-center gap-2.5 rounded-full border px-4 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="text-muted h-4 w-4 shrink-0"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="relative flex h-6 min-w-0 flex-1 items-center overflow-hidden text-sm">
              <span className="imm-int-placeholder text-muted absolute left-0 whitespace-nowrap">
                Cerca un&apos;integrazione…
              </span>
              <span className="imm-int-query text-foreground absolute left-0 font-medium whitespace-nowrap">
                pagamenti
              </span>
            </div>
            <span
              className="imm-int-badge bg-accent text-accent-contrast shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ opacity: 0 }}
            >
              2 risultati
            </span>
          </div>
        </div>

        {/* MURO DI LOGHI — griglia responsive 3 / 4 / 6 colonne */}
        <div className="grid w-full max-w-4xl grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-5">
          {TILES.map(({ icon, cat }) => (
            <div
              key={icon.title}
              className={cn(
                "imm-tile border-border bg-surface flex items-center justify-center rounded-xl border p-3 shadow-sm sm:rounded-2xl sm:p-4",
                cat === "Pagamenti" && "imm-tile-pay",
                icon === DETAIL.icon && "imm-int-open",
              )}
              style={{ opacity: 0 }}
            >
              {/* Logo nel colore ufficiale del brand (hex di simple-icons). */}
              <svg
                viewBox="0 0 24 24"
                role="img"
                aria-label={icon.title}
                className="h-7 w-7 sm:h-8 sm:w-8"
                focusable="false"
              >
                <title>{icon.title}</title>
                <path d={icon.path} fill={`#${icon.hex}`} />
              </svg>
            </div>
          ))}
        </div>

        {/* Dettaglio dell'integrazione (si apre al click, poi si richiude) */}
        <div
          className="imm-int-detail border-border bg-background absolute top-1/2 left-1/2 z-30 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-4 shadow-2xl"
          style={{ opacity: 0 }}
          aria-hidden
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: `#${DETAIL.icon.hex}1a` }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path d={DETAIL.icon.path} fill={`#${DETAIL.icon.hex}`} />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-foreground font-semibold">{DETAIL.icon.title}</p>
              <p className="text-muted text-xs">{DETAIL.cat}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {DETAIL.caps.map((c) => (
              <span
                key={c}
                className="bg-surface-2 text-muted rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="bg-accent text-accent-contrast mt-3 rounded-lg py-2 text-center text-sm font-semibold">
            Collega
          </div>
        </div>
      </div>

      {/* ── Frasi-intermezzo DESCRITTIVE ─────────────────────────────────────── */}
      <Say i={0}>Ci integriamo con i sistemi che usi ogni giorno.</Say>
      <Say i={1} variant="caption">
        …e con molti altri.
      </Say>
      <Say i={2} variant="caption">
        Cerca quello che ti serve: l&apos;elenco si filtra.
      </Say>
      <Say i={3} variant="caption">
        Un click e la colleghi.
      </Say>
    </ImmersiveStage>
  );
}
