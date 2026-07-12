# R3 — Layout armonico: da "demo" a vero layout da sito web

> Auto-contenuta. Ambiente/regole: `00-ORCHESTRATORE.md` §3–§4. Modello: **Opus 4.8, high**.
> Prerequisiti: R1, R4A, R4B chiuse (il contenuto delle scene è definitivo).
> Skill consigliate all'agente: `ui-ux-pro-max` (griglie, spacing, gerarchia).

## Obiettivo

Richiesta utente: le interfacce mostrate nelle scene devono sembrare **veri siti/app**,
non mock stiracchiati. Difetti dichiarati: **card troppo larghe, immagini troppo strette**,
proporzioni non armoniche. Serve un pass di layout su TUTTE le scene con regole comuni.

## FILE DI PROPRIETÀ

Tutte le scene: `apps/web/components/home/scenes/**`,
`apps/web/components/home/immersive/Immersive*.tsx`, `apps/web/components/home/showcase/**`.
`shared.tsx` solo per `ImmersiveStage`/frame se serve (annotare nel report).
NON toccare timeline/beat GSAP se non per aggiornare selettori spostati.

## Regole di layout comuni (applicale, non reinventarle per scena)

1. **Larghezza di lettura**: nessun blocco di contenuto oltre `max-w-6xl` (~1152px) sullo
   stage 1920px; testo corrente ≤ `max-w-prose`. Le UI mock (dashboard, gestionale,
   drawer) vivono in un "device frame" centrato con proporzioni realistiche
   (≈ 16:10 o rapporto da laptop), NON full-bleed da bordo a bordo.
2. **Card**: larghezza guidata dal contenuto — card KPI/statistiche 240–320px, card
   contenuto 360–480px; mai una card singola stirata su tutta la riga. Griglie con
   `grid-cols` esplicite + `gap` dalla scala (16/20/24), non `flex-1` che stira.
3. **Immagini**: SEMPRE `aspect-ratio` esplicito (16/9 per hero/screenshot, 4/3 per
   prodotto, 1/1 per avatar/thumb) + `object-cover`. Mai altezze fisse che schiacciano
   (es. `h-32` su colonna stretta → il difetto "immagini troppo strette").
4. **Ritmo verticale**: spaziature dalla scala 4/8: 8-12-16-24-32-48; niente valori
   spot (`py-[13px]`). Dentro una card: heading → gap 12 → corpo → gap 16 → azioni.
5. **Gerarchia tipografica**: max 3 livelli per schermata (titolo sezione / titolo card /
   corpo+meta). Meta e label mai sotto 11px equivalenti.
6. **Allineamento**: un asse per scena — o tutto centrato (capitoli narrativi) o griglia
   allineata a sinistra dentro il frame (UI mock). Non misto nella stessa schermata.

## Passata per scena (ordine = ordine capitoli)

Per OGNI scena: screenshot mentale a `progress(0.5)` e `progress(1)`, poi applica le
regole 1–6. Punti noti dalla lettura del codice (verificali a video, non fidarti ciecamente):

| Scena                                    | Sospetti da correggere                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `SolarTwinScene`                         | header mock + hero: verifica proporzioni frame video vs 1920×1080                         |
| `InterfacceScene`+`showcase/` (post-R4A) | ritmo carrellata, isole dark centrate, griglia finale                                     |
| `ImmersiveAssistente`                    | larghezza chat/pannello generato                                                          |
| `ImmersiveDashboard` (1022 righe)        | card contenuti/KPI stirate; thumbnail pagine strette                                      |
| `ImmersiveSegnalazioni` (post-R4B)       | immagine hero `h-32` su colonna 260px → aspect 16/9; drawer 400px ok ma card editor larga |
| `ImmersiveGestionale`                    | tabella/DataGrid: colonne proporzionate, non full-width forzata                           |
| `ImmersiveRicarica`                      | frame telefono: rapporto reale (~19.5:9), non allargato                                   |
| `ImmersiveIntegrazioni`                  | carrellata loghi: dimensioni uniformi, gap regolari                                       |
| `ClosingScene`                           | centratura CTA                                                                            |

## Vincoli specifici

- Solo classi Tailwind + token (`bg-surface`, `border-border`…): niente CSS nuovo globale,
  niente stili inline nuovi (regola best-practices).
- Se sposti/rinomini un nodo con classe-target GSAP (`.imm-*`, `.vw-*`, `.shw-*`),
  aggiorna il selettore nella timeline nello stesso commit e ri-verifica lo scrub.
- Target SOLO 1920×1080 (§3 orchestratore): non introdurre breakpoint nuovi, non
  rompere quelli esistenti.

## Accettazione

- [ ] `pnpm typecheck` + `pnpm build` verdi
- [ ] grep zero nelle scene: altezze immagine fisse senza aspect (`h-24|h-28|h-32` su `<img>`/wrapper immagine) · valori spot `\[(1[0-9]|[0-9])px\]` nuovi
- [ ] Verifica visiva 1920×1080 di TUTTI i capitoli a scrub completo: nessuna card
      full-width solitaria, nessuna immagine schiacciata
- [ ] Scrub e reduced-motion invariati (le timeline non sono state alterate)
- [ ] Report per-scena: cosa toccato, con motivo (1 riga a scena, stile caveman)

Commit suggerito: `refactor(home): pass di layout armonico su tutte le scene (proporzioni, aspect-ratio, griglie)`
