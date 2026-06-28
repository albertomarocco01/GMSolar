"use client";

/**
 * @descrizione  Beat "card 3D fluttuanti" della scena VETRINA. 4 card-tecnica +
 *   1 mini-mockup del sito, disposte in PROSPETTIVA CSS (perspective + rotateX/
 *   rotateY + translateZ) che danno profondità senza WebGL. In modalità animata
 *   ogni card galleggia con un auto-float morbido (keyframe CSS, fasi diverse) e
 *   il gruppo reagisce allo scroll via il wrapper `.vt-cards-tilt` (pilotato da
 *   GSAP nella scena padre). Solo transform/translate: zero dipendenze 3D.
 *
 *   - animated=true  → mobile: griglia statica leggibile; md+: scatter in
 *     prospettiva con float + tilt-da-scroll.
 *   - animated=false → (reduced-motion) griglia statica a ogni larghezza, nessuna
 *     animazione, nessuna prospettiva: contenuto piano e leggibile.
 * @indice
 * - FloatingCards → il beat (sceglie scatter animato vs griglia statica)
 * - CARDS         → contenuti che rafforzano il brand (le "tecniche")
 * - Card / MockupCard → singola card e mini-anteprima del sito
 */
import { cn } from "@gmgroup/lib/utils";
import { IconLayers, IconCube, IconGauge, IconWand } from "./VetrinaIcons";

type Feature = {
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  title: string;
  body: string;
  /** Classi di posizione/larghezza applicate SOLO da md+ (scatter). */
  pos: string;
  /** Posa 3D (consumata da `.vt-card-face` solo da md+, vedi <style>). */
  pose: string;
  /** Durata e sfasamento dell'auto-float (CSS custom props). */
  dur: string;
  delay: string;
};

/** Le quattro "tecniche" che raccontano il modo di lavorare (tono descrittivo). */
const CARDS: Feature[] = [
  {
    Icon: IconLayers,
    title: "Scrollytelling",
    body: "Il racconto avanza con lo scroll: ogni capitolo entra quando serve.",
    pos: "md:left-[1%] md:top-[15%] md:w-[18rem] lg:w-[20rem]",
    pose: "rotateY(18deg) rotateX(6deg) translateZ(30px)",
    dur: "7s",
    delay: "0s",
  },
  {
    Icon: IconCube,
    title: "3D in tempo reale",
    body: "Scene WebGL renderizzate nel browser, non video pre-registrati.",
    pos: "md:left-[60%] md:top-[6%] md:w-[18rem] lg:w-[20rem]",
    pose: "rotateY(-16deg) rotateX(7deg) translateZ(60px)",
    dur: "8.5s",
    delay: "-1.6s",
  },
  {
    Icon: IconGauge,
    title: "Performance",
    body: "Lazy-load, 60 fps e fallback puliti: fluido anche su mobile.",
    pos: "md:left-[5%] md:top-[58%] md:w-[17rem] lg:w-[19rem]",
    pose: "rotateY(15deg) rotateX(-6deg) translateZ(20px)",
    dur: "9.5s",
    delay: "-3.2s",
  },
  {
    Icon: IconWand,
    title: "Motion su misura",
    body: "Animazioni costruite sul vostro contenuto, mai template generici.",
    pos: "md:left-[62%] md:top-[60%] md:w-[17rem] lg:w-[19rem]",
    pose: "rotateY(-14deg) rotateX(-6deg) translateZ(45px)",
    dur: "8s",
    delay: "-4.5s",
  },
];

/** Posa/float della mini-anteprima (la card più "in primo piano", al centro). */
const MOCKUP = {
  pos: "md:left-[33%] md:top-[28%] md:w-[20rem] lg:w-[22rem]",
  pose: "rotateY(-3deg) rotateX(5deg) translateZ(100px)",
  dur: "10s",
  delay: "-2.4s",
};

/** CSS custom props inline (TS strict): castiamo come fa lo shared dell'app. */
function vars(v: Record<string, string>): React.CSSProperties {
  return v as unknown as React.CSSProperties;
}

export default function FloatingCards({ animated }: { animated: boolean }) {
  /* ---- reduced-motion: griglia statica, piana, leggibile (niente 3D) ---- */
  if (!animated) {
    return (
      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Card key={c.title} feature={c} />
        ))}
        <MockupCard className="sm:col-span-2" />
      </div>
    );
  }

  /* ---- animata: griglia (mobile) → scatter in prospettiva (md+) ---- */
  return (
    <div className="vt-cards-scene relative h-full w-full md:[perspective:1400px]">
      {/* Stile auto-contenuto: posa 3D (md+) + auto-float (md+ & motion-safe). */}
      <style>{`
        @media (min-width: 768px) {
          .vt-card-face { transform: var(--pose); }
        }
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          .vt-card {
            animation: vt-float var(--vt-dur, 7s) var(--vt-delay, 0s) ease-in-out infinite alternate;
          }
        }
        @keyframes vt-float {
          from { translate: 0 -9px; }
          to   { translate: 0 9px; }
        }
      `}</style>

      {/* .vt-cards-tilt = il gruppo che GSAP inclina/parallaxa con lo scroll. */}
      <div className="vt-cards-tilt h-full w-full md:[transform-style:preserve-3d]">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:block md:h-full md:[transform-style:preserve-3d]">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className={cn("vt-card relative md:absolute md:[transform-style:preserve-3d]", c.pos)}
              style={vars({ "--vt-dur": c.dur, "--vt-delay": c.delay })}
            >
              <Card feature={c} face />
            </div>
          ))}

          {/* mini-mockup del sito: la card più in primo piano */}
          <div
            className={cn(
              "vt-card relative col-span-2 md:absolute md:col-span-1 md:[transform-style:preserve-3d]",
              MOCKUP.pos,
            )}
            style={vars({ "--vt-dur": MOCKUP.dur, "--vt-delay": MOCKUP.delay })}
          >
            <MockupCard face pose={MOCKUP.pose} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Card-tecnica: vetro chiaro sopra il video, icona in chip accent. ---- */
function Card({ feature, face }: { feature: Feature; face?: boolean }) {
  const { Icon, title, body, pose } = feature;
  return (
    <div
      className={cn(
        "shadow-lift h-full rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md",
        face && "vt-card-face",
      )}
      style={face ? vars({ "--pose": pose }) : undefined}
    >
      <span className="bg-accent/90 text-accent-contrast inline-flex h-10 w-10 items-center justify-center rounded-xl">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-display mt-4 text-lg font-bold tracking-tight">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-white/80">{body}</p>
    </div>
  );
}

/* ---- Mini-mockup: un finto sito (chrome + skeleton) = "il vostro sito". ---- */
function MockupCard({
  face,
  pose,
  className,
}: {
  face?: boolean;
  pose?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shadow-lift overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md",
        face && "vt-card-face",
        className,
      )}
      style={face && pose ? vars({ "--pose": pose }) : undefined}
    >
      {/* chrome del browser */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
        </span>
        <span className="ml-1 truncate rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
          gmgroup.it
        </span>
      </div>
      {/* skeleton del contenuto */}
      <div className="space-y-2.5 p-4">
        <div className="bg-accent/80 h-12 rounded-lg" />
        <div className="h-2.5 w-4/5 rounded-full bg-white/30" />
        <div className="h-2.5 w-3/5 rounded-full bg-white/20" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="h-9 rounded-md bg-white/15" />
          <div className="h-9 rounded-md bg-white/15" />
          <div className="h-9 rounded-md bg-white/15" />
        </div>
      </div>
      <p className="px-4 pb-3 text-[11px] font-medium tracking-wide text-white/55">
        Il vostro sito
      </p>
    </div>
  );
}
