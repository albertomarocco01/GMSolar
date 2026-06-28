import Button from "@gmgroup/ui/Button";
import SplitTextReveal from "@gmgroup/ui/SplitTextReveal";
import AnimatedCounter from "@gmgroup/ui/AnimatedCounter";
import { cn } from "@gmgroup/lib/utils";
import DemoThumb from "./DemoThumb";
import { ACCENTS, BRAND_LABEL, DEMOS, STATUS } from "./catalog";
import type { AccentKey } from "./types";
import { THEME_FOR_WORLD, type TourSlide as Slide } from "./tour";

/**
 * Guscio comune di una slide: full-bleed, base scura immersiva (come Stories),
 * con due "blooms" radiali del colore del brand. Imposta:
 *  - `data-theme` → ri-tematizza l'accent del sottoalbero sul brand (Button);
 *  - `--card-accent/ink/soft` → consumate dai blooms e da DemoThumb/Motif.
 * Su base scura il testo è sempre chiaro (white/…); l'accent pieno è usato per i
 * titoli grandi e gli accenti (su nero ha ottimo contrasto).
 */
function SlideShell({
  world,
  className,
  children,
}: {
  world: AccentKey;
  className?: string;
  children: React.ReactNode;
}) {
  const accent = ACCENTS[world];
  return (
    <div
      data-theme={THEME_FOR_WORLD[world]}
      style={
        {
          "--card-accent": accent.fill,
          "--card-ink": accent.ink,
          "--card-soft": accent.soft,
        } as React.CSSProperties
      }
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#07090d] text-white"
    >
      {/* Blooms d'accento (decorativi): danno la "vibe" Wrapped e fanno la
          transizione di colore nel crossfade tra slide. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full opacity-25 blur-[100px] [background:radial-gradient(circle,var(--card-accent),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/3 left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full opacity-20 blur-[110px] [background:radial-gradient(circle,var(--card-accent),transparent_60%)]"
      />
      <div
        className={cn(
          "relative z-10 flex h-full w-full max-w-md flex-col items-center justify-center px-6 pt-24 pb-36 text-center",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Etichetta piccola in maiuscolo, sempre chiara su sfondo scuro. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold tracking-[0.25em] text-white/60 uppercase">
      {children}
    </span>
  );
}

/** Slide introduttiva con conteggi animati. */
function IntroSlide() {
  return (
    <SlideShell world="group" className="gap-6">
      <Eyebrow>GM Group</Eyebrow>
      <SplitTextReveal
        as="h1"
        text="Il tour delle demo"
        className="font-display text-(--card-accent) text-3xl font-bold tracking-tight text-balance sm:text-4xl"
      />
      <p className="max-w-sm text-base leading-relaxed text-white/75">
        Un viaggio guidato tra le esperienze dell&apos;ecosistema: produci energia, muoviti
        elettrico, collega tutto.
      </p>
      <div className="mt-2 flex items-stretch gap-8">
        <div className="flex flex-col">
          <AnimatedCounter
            value={DEMOS.length}
            className="font-display text-(--card-accent) text-5xl font-bold"
          />
          <span className="mt-1 text-xs tracking-widest text-white/60 uppercase">demo</span>
        </div>
        <div aria-hidden className="w-px bg-white/15" />
        <div className="flex flex-col">
          <AnimatedCounter
            value={3}
            className="font-display text-(--card-accent) text-5xl font-bold"
          />
          <span className="mt-1 text-xs tracking-widest text-white/60 uppercase">mondi</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-white/55">
        Tocca a destra per avanzare, a sinistra per tornare. Swipe o frecce ← →.
      </p>
    </SlideShell>
  );
}

/** Slide di una demo: anteprima, titolo, descrizione e CTA (o stato "In arrivo"). */
function DemoSlide({ slide }: { slide: Extract<Slide, { kind: "demo" }> }) {
  const { demo } = slide;
  const isLive = Boolean(demo.href);
  return (
    <SlideShell world={demo.world} className="gap-5">
      <Eyebrow>
        {BRAND_LABEL[demo.world]} · {STATUS[demo.status].label}
      </Eyebrow>

      {/* Anteprima placeholder riusata dal launcher (decorativa). */}
      <div className="w-full max-w-[16rem] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <DemoThumb demo={demo} />
      </div>

      <SplitTextReveal
        as="h1"
        text={demo.title}
        className="font-display text-(--card-accent) text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl"
      />
      <p className="max-w-md text-base leading-relaxed text-white/75">{demo.description}</p>

      {isLive ? (
        // Apre la demo reale in una NUOVA scheda così il tour non perde il segno.
        <Button
          href={demo.href!}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          className="mt-1"
        >
          Apri la demo <span aria-hidden>→</span>
        </Button>
      ) : (
        <span className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white/70">
          <span className={cn("h-2 w-2 rounded-full", STATUS.wip.dot)} aria-hidden />
          In arrivo · disponibile a breve
        </span>
      )}
    </SlideShell>
  );
}

/** Recap finale: elenco compatto + CTA "Ricomincia" e "Torna al launcher". */
function ClosingSlide({ onRestart }: { onRestart?: () => void }) {
  return (
    <SlideShell world="group" className="gap-6">
      <Eyebrow>Fine del tour</Eyebrow>
      <SplitTextReveal
        as="h1"
        text="Tutto l'ecosistema, in un colpo d'occhio"
        className="font-display text-(--card-accent) text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl"
      />

      <ul className="grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-1.5 text-left">
        {DEMOS.map((demo) => (
          <li key={demo.key} className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: ACCENTS[demo.world].fill }}
            />
            <span className="truncate text-xs text-white/75">{demo.title}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={onRestart} size="lg">
          <span aria-hidden>↺</span> Ricomincia
        </Button>
        <Button href="/demos" variant="outline" size="lg">
          Torna al launcher
        </Button>
      </div>
    </SlideShell>
  );
}

/** Dispatcher: rende la slide in base al tipo. */
export default function TourSlide({
  slide,
  onRestart,
}: {
  slide: Slide;
  onRestart?: () => void;
}) {
  if (slide.kind === "intro") return <IntroSlide />;
  if (slide.kind === "closing") return <ClosingSlide onRestart={onRestart} />;
  return <DemoSlide slide={slide} />;
}
