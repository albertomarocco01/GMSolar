# Vetrina Servizi — presentazione interattiva

> Generato da Code Maniac `init` · 2026-06-28. **Fonte di verità della commessa:** confermata dall'utente via Specchio della Commessa (3 bivi sciolti). I task futuri si controllano contro questo documento.

## La commessa (confermata)

Trasformare la webapp esistente (nata come demo per vincere la commessa GM Group) in una
**presentazione interattiva di proposte-servizi**, da mostrare a un cliente per **vendere ciò che
sappiamo costruire**. Non un prodotto finito né pagine complete: una **presentazione animata** che,
tramite **flussi-utente animati**, fa capire le capacità tecniche concrete.

Decisioni confermate (Specchio):

1. **Identità:** è una presentazione di proposte da noi → cliente. **Nessun branding** (né uno
   studio nostro, né GM). I brand reali (GM Solar/GMobility/Cavo Perfetto) restano solo come
   _esempio vivo_ del servizio "sito vetrina", **senza loghi e senza nomi in evidenza**.
2. **Esperienza top-level:** **scroll-narrativa cinematica** — una landing unica che scorre i
   servizi in sequenza, ognuno con un momento "wow" e deep-link a una demo interattiva.
3. **Font:** **Geist + Geist Mono** (sostituiscono Inter + Space Grotesk).

I sette servizi da raccontare:

| #   | Servizio                                                                     | Stato attuale nel codice                                                   |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Siti vetrina moderni (scrollytelling video)                                  | ✅ scena Solare (hero video scrubbato) + `InterfacceScene` (componenti UI) |
| 2   | Assistente AI di prodotto (risponde, genera l'interfaccia)                   | ✅ `ImmersiveAssistente` (mock)                                            |
| 3   | Dashboard centralizzata: gestione contenuti + telemetria multi-sito          | ✅ `ImmersiveDashboard` (mock)                                             |
| 4   | Pannello segnalazioni (bug / richieste, con fix mostrato)                    | ✅ `ImmersiveSegnalazioni` (mock)                                          |
| 5   | Gestionali su misura con assistente AI (esempio vivo: colonnine di ricarica) | ✅ `ImmersiveGestionale` (mock)                                            |
| 6   | App di ricarica EV con assistente AI integrato                               | ✅ `ImmersiveRicarica` (mock)                                              |
| 7   | Integrazioni API (carrellata loghi + esempio WhatsApp)                       | ✅ `ImmersiveIntegrazioni` (mock)                                          |

> **Nota:** la numerazione qui sopra è quella del brief; la narrativa della home è a
> **8 capitoli** (01→08, vedi «Stato della home» qui sotto).

## Stato della home (aggiornato dopo migliorie round 3 — `docs/roadmap-migliorie-3/`, R1–R2 tutte chiuse)

La home (`apps/web/app/page.tsx`) è la presentazione scrollytelling chromeless. Ordine
delle scene, tutte `<section>` figlie di `#top` (capitoli 01→08):

1. **Siti vetrina** (`scenes/SolarTwinScene.tsx`) — finto sito vetrina: header mock + hero
   video scrubbato (`/assets/solar-twin.mp4`, all-keyframe, corsa fino a `VIDEO_END=0.92`),
   SOLO video (niente card 3D). Apre con una **title card di capitolo one-shot** (chiara,
   titolo nero) mostrata e **tenuta ferma PRIMA** che parta lo scroll (evento
   `presentation:introdone` → AutoScroll), poi si solleva rivelando l'hero.
2. **Interfacce grafiche moderne** (`scenes/InterfacceScene.tsx`, **v4 — R4A**) —
   **showcase di card UI moderne** (`home/showcase/`): vetro liquido (LiquidGlassCard),
   glassmorphism con form (GlassFormCard), card elettrica/neon scura (ElectricCard) e
   micro-interazioni sui bottoni (AnimatedButtonsCard). Carrellata scrubbata card per
   card, poi griglia finale 2×2 «Stili diversi, la stessa cura». Isole dark ammesse su
   fondo chiaro; `backdrop-filter` solo su superfici piccole statiche, mai in scrub.
3. **Assistente AI** · 4. **Dashboard** · 5. **Segnalazioni** · 6. **Gestionali su misura**
   · 7. **App con assistente AI integrato** · 8. **Integrazioni** — scene immersive
   (`components/home/immersive/`) costruite sul kit `shared.tsx` (`useImmersiveScene`):
   timeline **scrubbata dallo scroll**, cursore finto, `Say`/caption, e **camera
   cinematografica** (`cameraTo/Follow/Whip`, `rackFocus`, `cameraTrackType` — la camera
   **trasla col caret durante le digitazioni**) — motion design "da After Effects".
   Dashboard e Segnalazioni usano **foto prodotto reali** (`/assets/products/`, le stesse
   dell'Assistente; niente emoji, niente gradient); la hero «impianto-2026.jpg» è la
   stessa foto in Dashboard (pubblicazione) e Segnalazioni (fix).
4. **Chiusura** (`scenes/ClosingScene.tsx`) — SOLO «Rivedi la presentazione» su loop di
   sfondo discreto (aloni accent che respirano; si ferma in pausa e con reduced-motion).

Sistemi trasversali:

- **Layout armonico (R3)**: le UI mock vivono in **device frame** centrati (~16:10,
  `max-w-6xl`), mai full-bleed; immagini SEMPRE con `aspect-ratio` esplicito +
  `object-cover`; card con larghezza da contenuto (KPI 240–320px, contenuto 360–480px);
  spaziature dalla scala 4/8; telefono Ricarica a rapporto reale ~19.5:9.
- **Linguaggio di motion (R2)**: definito UNA volta nel kit `shared.tsx` — palette di 4
  ease nominate (`EASE_IN_SCENE` expo.out · `EASE_OUT_SCENE` power2.in · `EASE_SNAP`
  back.out(1.6) · `EASE_CAMERA` power1.inOut, mai back) + scala durate `DUR`
  (micro 0.3 · beat 0.6 · scene 1.0 · hold 0.8) + helper `hold()` (respiro) ed
  `enter()` (ingresso con anticipazione/settle). Lo **stacco tra capitoli** è
  standardizzato in `chapterIntro` (stessa durata/curva ovunque); i loop decorativi
  respirano a periodo comune 3.2s. Eccezioni solo con commento `// motion:`.

- **Capitoli + HUD** (P12): ogni scena apre con una `ChapterCard` **chiara** (titolo nero
  grande che si rivela con un **wipe continuo sinistra→destra**; la numerazione «0X / 08» è
  stata RIMOSSA ovunque, resta solo il titolo — in `shared.tsx`); `ChapterHUD.tsx` (montato
  in `page.tsx`, sotto la nav mock del cap. 01) mostra il titolo del capitolo corrente +
  mini-rail a 8 puntini.
- **Scorrimento automatico** (`AutoScroll.tsx`): profilo di velocità **a campana** per tratto
  (lento → picco `PEAK_SPEED` a metà → lento, `sin(π·p)`; variante gaussiana commentata) con
  `MIN_SPEED` anti-stallo e carry sub-pixel. L'auto è **solo-avanti**: con input verso
  l'ALTO (wheel/tasti) entra in intento «indietro» e NON riparte da sola finché l'utente
  non scrolla di nuovo verso il basso (fix «impossibile risalire dalla scena video»). La **pausa globale**
  (click) congela auto-scroll + keyframe CSS + tween `repeat:-1` + video liberi
  (`data-presentation-paused` + evento `presentation:pausechange`). Replay = reload dalla cima.
- **Rimossi**: le vecchie scene video drone e cavo EV, la ricerca Integrazioni, i dati
  economici del gestionale, il badge «GM Charge».
- **Reduced-motion**: ogni scena porta la timeline a `progress(1)` con stato finale
  leggibile + heading statico di capitolo; camera azzerata da rete di sicurezza nel kit.
- **AI/integrazioni**: sempre SIMULATE (nessun provider esterno chiamato).

## A cosa serve / per chi

- **Scopo:** strumento commerciale. Convincere un cliente mostrando _capacità_, non consegnando
  prodotti. Vince chi crea momenti "wow" + storia chiara + prova di tech moderna.
- **Utenti:** chi presenta (noi, in demo dal vivo o link) e il cliente che la sfoglia.
- **Obiettivo che conta davvero:** comunicare in pochi minuti la gamma di servizi e la qualità
  tecnica, con flussi animati credibili. Non la completezza funzionale.

## Vincoli

- **Tecnici:** è una DEMO → **tutto mock/placeholder** dove non è un sito vetrina già pronto
  (dashboard, telemetria, gestionale, segnalazioni = UI + dati finti realistici; **niente backend
  reale, niente CMS, niente pagamenti**). Struttura per swap futuro degli asset/dati reali.
  **AI e integrazioni sempre SIMULATE**: nessun provider/SDK esterno viene mai chiamato (i
  resolver AI sono forzati a `null` in `lib/ai.ts` e `cable-finder/providers.ts`), neanche con una
  chiave in env. Le risposte sono **deterministiche/finte** — la demo non dipende da rete, costi o
  chiavi e non si rompe mai. Le chiavi, se un giorno servissero in produzione, vivrebbero comunque
  **solo server-side**. Mobile-first, accessibile (a11y ≥ AA), italiano lingua
  principale. Rispetto **sempre** di `prefers-reduced-motion`. Performance prima dell'effetto
  (lazy-load 3D, Suspense, fallback poster).
- **Cosa NON si tocca senza autorizzazione esplicita:** di norma la zona condivisa
  (`packages/ui`, `packages/tokens`, `packages/lib`, layout, providers). **Eccezione autorizzata
  per questa commessa:** la **Fase Fondazione** rifà font + palette + shell de-brandizzata nella
  zona condivisa — ma resta una fase **serializzata, a singolo scrittore** (mai scrittori
  paralleli sui file condivisi). Le demo nuove vivono in cartelle **disgiunte** e non toccano la
  zona condivisa: si registrano via un registry dati creato nella Fondazione.
- **Definizione di "fatto" (a livello progetto):** `pnpm build` + `pnpm typecheck` verdi; lint
  senza nuovi warning; `scan` senza nuovi problemi; ogni servizio ha un momento dimostrabile dal
  vivo; a11y/perf non regredite; nessun segreto nel client.

## Stack (rilevato)

- **Monorepo** Turborepo + pnpm workspaces: app unica `apps/web` + librerie `packages/{ui,tokens,lib,config}`.
- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict).
- **Tailwind CSS v4** con token centralizzati in `packages/tokens/tokens.css` (`@theme` + `@theme inline`); accent ri-tematizzato per route via `ThemeProvider` (`data-theme` su `<html>`).
- **Animazioni:** GSAP + ScrollTrigger + Lenis (`@gmgroup/lib/{gsap,motion}`), reduced-motion gestito.
- **3D:** React Three Fiber + drei + postprocessing (solo mobility).
- **Mappe:** MapLibre GL (+ Open Charge Map per mobility).
- **AI:** route handler server-side, helper multi-provider `apps/web/lib/ai.ts` (Anthropic default `claude-opus-4-8` / Gemini / DeepSeek), fallback deterministico. Cable-finder ha un helper di streaming a parte.
- **Altri:** lucide-react, motion, recharts, sharp.
- **Tooling:** ESLint + Prettier · pnpm. Deploy: Vercel.

## Linguaggio di dominio (ubiquitous language)

| Termine            | Significato                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Servizio           | Una delle 7 proposte commerciali raccontate nella presentazione.                             |
| Capitolo           | Sezione della scroll-narrativa che presenta un servizio con un momento "wow".                |
| Demo / flusso      | Esperienza interattiva collegata a un servizio (deep-link dal capitolo).                     |
| Mock               | UI con dati finti realistici, senza backend reale (regola di progetto).                      |
| Mondo              | Sito vetrina d'esempio (solar / mobility / shop), prova del servizio #1.                     |
| Accent / tema      | Colore runtime per "zona", impostato da `ThemeProvider` via `data-theme`.                    |
| Token              | Variabile del design system in `packages/tokens` — fonte unica di colore/tipografia/spacing. |
| Registry servizi   | Dato unico che elenca i 7 servizi (per nav + landing), creato in Fondazione.                 |
| Degrado con grazia | Comportamento di fallback quando manca una chiave/asset: la demo resta usabile.              |

## Convenzioni

Vedi `docs/convenzioni/best-practices.md` (droppato da Code Maniac). Priorità di comportamento:
correttezza > sicurezza > leggibilità/tracciabilità > type-safety > accessibilità > minimalismo >
performance (vedi taratura della costituzione in fondo a `ROADMAP-MULTIAGENTE.md`).
