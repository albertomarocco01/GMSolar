# R4A — Capitolo «Interfacce grafiche moderne» v4: showcase UI avanzata

> Auto-contenuta. Ambiente/regole: `00-ORCHESTRATORE.md` §3–§4. Modello: **Opus 4.8, high**.
> Prerequisito: R1 chiusa. Può girare **in parallelo a R4B** (file disgiunti).
> Skill consigliate all'agente: `frontend-design`, `ui-ux-pro-max` (stili glassmorphism ecc.).

## Obiettivo

Oggi il capitolo 02 mostra snippet del sito gmsolar (VetrinaTeaser): racconta "sito
vetrina", non "interfacce moderne" — ed è ridondante col capitolo 01. Richiesta utente:
**una carrellata di card super-moderne in stili diversi** che dimostri capacità UI
avanzata: **liquid glass, glassmorphism, card "elettriche"** (bordi neon/glow animati),
**bottoni animati**, micro-interazioni avanzate. Il cliente deve pensare: "questi sanno
fare interfacce di livello".

## FILE DI PROPRIETÀ

- `apps/web/components/home/scenes/InterfacceScene.tsx` (riscrittura)
- `apps/web/components/home/showcase/**` (NUOVA cartella: una card per file, piccoli e riusabili)
- `apps/web/components/home/vetrina/**` — dopo lo switch verifica con knip/grafo: se
  `VetrinaTeaser` resta orfano, ELIMINALO (ponytail), citandolo nel report.
- `shared.tsx`: **SOLA LETTURA** (helper nuovi → annotali nel report per R2).

## Design della scena (v4)

Timeline scrubbata (`useImmersiveScene`), stessa struttura dei capitoli sorelle:

1. **ChapterCard** «Interfacce grafiche moderne», sottotitolo tipo
   «Stili diversi, la stessa cura.» (copy libero, descrittivo, non markettaro).
2. **Carrellata orizzontale scrubbata**: un binario di 4–5 "pezzi" che attraversano lo
   stage mentre si scrolla (translateX del binario, non scroll nativo). Ogni pezzo entra,
   si ferma al centro, fa la sua micro-vita, esce. Pezzi:
   - **Liquid glass** — card stile Apple 2025: superficie traslucida con rifrazione
     simulata (layer gradient + highlight speculare che scivola via transform),
     `backdrop-blur` statico ammesso (regola §4.5), bordo 1px bianco/20.
   - **Glassmorphism classico** — pannello smerigliato su blob colorati sfocati di
     sfondo; dentro un mini-form: input con label flottante che si compila da solo
     (riusa `typeInField`) e bottone che si preme (`pressButton`).
   - **Card elettrica** — dark card con bordo conic-gradient rotante (glow lime/ciano),
     scanline sottile; dentro un dato "live" (counter con `countUp`).
   - **Bottoni animati** — fila di 3 bottoni, ognuno con micro-interazione diversa:
     magnetic hover (simulato dal cursore finto), fill che scorre, morph icona→spinner→check.
   - **(Opzionale se il ritmo regge) Bento tile** — mini-bento 2×2 con tile che si
     rivelano a maschera (`maskReveal`), a chiudere.
3. **Hold finale**: i pezzi si ricompongono in una griglia compatta leggibile (stato di
   `progress(1)` per reduced-motion: tutti i pezzi visibili, statici, griglia ordinata).

Il cursore finto (`cursorTo`) fa da "dito" sulle interazioni: è ciò che rende la
carrellata una DEMO e non un poster.

## Vincoli specifici

- Ogni card = componente proprio in `showcase/`, ≤150 righe, zero stato React per
  l'animazione (tutto GSAP via classi `.shw-*`).
- Il capitolo resta su **fondo chiaro** di base, ma i pezzi dark (elettrica) vivono su
  una propria "isola" scura: contrasto AA sui testi in entrambi i contesti.
- Niente librerie nuove. Glow/rifrazioni = CSS (gradient, mask, shadow) + transform GSAP.
- `heightVh` della scena: ricalibra (~500–560) perché la carrellata ha più beat del teaser.
- Le keyword di stile (liquid glass, glassmorphism…) NON compaiono nella UI come
  etichette tecniche in inglese da sole: ogni pezzo ha una micro-caption italiana
  (es. «Vetro liquido», «Glassmorphism», «Neon») — servono al racconto.

## Accettazione

- [ ] `pnpm typecheck` + `pnpm build` verdi
- [ ] grep zero: `VetrinaTeaser` fuori da `vetrina/` (o cartella eliminata)
- [ ] Scrub avanti/indietro senza salti; pausa globale congela anche i glow in loop
      (`data-presentation-paused`)
- [ ] Reduced-motion: griglia finale statica leggibile + heading capitolo
- [ ] 60 fps a 1920×1080 (DevTools performance: no long task da `backdrop-filter` animato)
- [ ] Report: eventuali helper mancanti nel kit annotati per R2

Commit suggerito: `feat(home): capitolo Interfacce v4 — showcase UI moderne (liquid glass, glass, electric)`
