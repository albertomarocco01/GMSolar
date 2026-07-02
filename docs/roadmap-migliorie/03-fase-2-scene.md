# FASE 2 — Riscrittura delle scene (P3, P4, P5, P7, P8, P9, P10)

**Prompt coperti:** P3 Solare, P4 Assistente-foto, P5 Dashboard, P7 Gestionale,
P8 Ricarica, P9 Integrazioni, P10 Chiusura.
**Parallelismo:** 7 builder in PARALLELO (ownership disgiunta) → 1 controllo →
2 reviewer in parallelo → fix loop.
**Gate d'ingresso:** tag `roadmap-fase-1-ok`.
**NOTA:** P6 (Segnalazioni) NON è in questa fase: dipende dal bottone creato da P5
e tocca `page.tsx` → è la Fase 3.

## Ondata 1 — 7 builder (un solo messaggio di lancio)

Per tutti: template §8.1 del file 00 + le deviazioni pertinenti da `_ricognizione.md`.

| ID | P | File di proprietà | Note di integrazione specifiche |
|---|---|---|---|
| B-P3 | 3 | `scenes/SolarTwinScene.tsx` (riscrittura), `scenes/VideoScrubScene.tsx` (delete se orfano), `ScrollCue.tsx`, `vetrina/SuspendedCards.tsx`, `vetrina/VetrinaFilmGrade.tsx` + `vetrina/VetrinaIcons.tsx` (delete se orfani) | «P1 è già stato eseguito: VideoScrubScene non ha più la modalità free e la tua scena è la PRIMA della home. Prima di eliminare VideoScrubScene fai grep dei suoi import; se dopo la delete restano ORFANI `vetrina/VetrinaFilmGrade.tsx` o `vetrina/VetrinaIcons.tsx`, eliminali (a meno che la tua nuova scena non li riusi). PRESERVA `id="vetrina"` sulla section: `kb.ts` linka `/#vetrina` (P1 potrebbe averlo già spostato qui — verificalo). La micro-demo del cue è un tween `repeat:-1` FUORI dalla timeline scrubbata: oltre a uccidersi al primo scroll DEVE fare pause/resume sull'evento `presentation:pausechange` (stesso pattern dei float di ImmersiveIntegrazioni). NON toccare `page.tsx`. `SuspendedCards` non è importata da nessun altro file: puoi adattarla liberamente.» |
| B-P4 | 4 | `immersive/ImmersiveAssistente.tsx`, `apps/web/public/assets/products/**` (nuova cartella) | «Se il download da Unsplash fallisce (rete bloccata): FALLBACK GARANTITO senza dipendenze = 7 placeholder SVG locali (gradiente + silhouette prodotto + etichetta; stessa naming convention con estensione .svg e src aggiornati) oppure JPEG generati via PowerShell/System.Drawing. Annota la deviazione nel report. NON aggiungere dipendenze a package.json. Peso: ≤150 KB per file (come da prompt P4).» |
| B-P5 | 5 | `immersive/ImmersiveDashboard.tsx` | «Il bottone `imm-report-btn` che crei verrà riusato ALLA LETTERA dalla Fase 3 (P6): rispetta esattamente classi e testo del prompt («Segnala un problema», `bg-accent-soft text-accent-ink`, icona MessageSquareWarning). Riporta nel report la firma esatta del bottone.» |
| B-P7 | 7 | `immersive/ImmersiveGestionale.tsx` | «Solo questo file. L'ordine delle scene in page.tsx NON è compito tuo.» |
| B-P8 | 8 | `immersive/ImmersiveRicarica.tsx` | «Task piccolo e chirurgico: badge + testi. Non rifattorizzare altro.» |
| B-P9 | 9 | `immersive/ImmersiveIntegrazioni.tsx` | «⚠ CRITICO: nella Fase 1 questo file ha ricevuto un listener `presentation:pausechange` che mette in pausa i tween float. DEVI PRESERVARLO (o ricrearlo identico se la tua riscrittura lo elimina): a fine task `rg "presentation:pausechange" <file>` deve trovare il listener con relativo cleanup. Applica lo stesso pause/resume a eventuali NUOVI tween `repeat:-1` che introduci.» |
| B-P10 | 10 | `scenes/ClosingScene.tsx` | «Solo questo file. ReplayButton non si tocca.» |

## Ondata 2 — Controllo (dopo i 7 report)

Template §8.3. Comandi:
```powershell
pnpm typecheck
pnpm build
```
Grep di accettazione (ZERO risultati attesi, scope `apps/web`):
```powershell
rg "CableIcon|ProductArtwork|MiniArt|CARD_WASH" apps/web/components/home/immersive/ImmersiveAssistente.tsx
rg "Evaso|Pipeline|€" apps/web/components/home/immersive/ImmersiveGestionale.tsx
rg "GM Charge|imm-webapp-tag" apps/web
rg "imm-int-search|imm-int-detail|Cerca un|pagamenti" apps/web/components/home/immersive/ImmersiveIntegrazioni.tsx
rg "SERVIZI" apps/web/components/home/scenes/ClosingScene.tsx
rg "VideoScrubScene" apps/web        # se B-P3 l'ha eliminato: zero import residui
```
Grep di presenza (≥1 risultato):
```powershell
rg "imm-report-btn" apps/web/components/home/immersive/ImmersiveDashboard.tsx
rg "presentation:pausechange" apps/web/components/home/immersive/ImmersiveIntegrazioni.tsx
rg "SuspendedCards" apps/web/components/home/scenes/SolarTwinScene.tsx
rg "solar-twin.mp4" apps/web/components/home/scenes/SolarTwinScene.tsx
Get-ChildItem apps/web/public/assets/products | Where-Object Length -gt 150KB
# atteso: output VUOTO (7 file presenti, ognuno ≤150 KB)
rg "id=\"vetrina\"" apps/web/components/home/scenes/SolarTwinScene.tsx
# richiesto SOLO se la ricognizione (Fase 0) ha confermato link a /#vetrina (kb.ts)
```
Checklist statica:
- [ ] SolarTwinScene: micro-demo del cue si uccide al primo scroll (cerca kill del
      tween nel codice) E fa pause/resume su `presentation:pausechange`; nessun
      `repeat:-1` DENTRO la timeline scrubbata.
- [ ] `rg "VetrinaFilmGrade|VetrinaIcons" apps/web` → o zero (file eliminati) o
      solo import realmente usati dalla nuova scena (niente orfani).
- [ ] ImmersiveDashboard: «Cavo Type 2» (niente «Type-C»).
- [ ] ImmersiveIntegrazioni: chat WhatsApp usa `siWhatsapp.hex` (niente colore hardcoded).
- [ ] Ogni scena riscritta conserva la variante reduced-motion leggibile
      (gsap.set iniziali + stato finale sensato a progress(1)).
- [ ] Nessun nuovo pacchetto in `package.json` (nessuno dei task lo richiede).

## Ondata 3 — 2 reviewer in parallelo (adversarial, template §8.2)

- **R-A (scene video + statiche):** P3, P10 + P4. Focus: scrub-safety della scena
  solare (tween deterministici, demo-loop FUORI dalla timeline scrubbata e killata
  al primo scroll), correttezza exitToLight, immagini locali (no hotlink), pesi file.
- **R-B (scene immersive):** P5, P7, P8, P9. Focus: coerenza col kit `shared.tsx`
  (helper usati correttamente, selettori esistenti), stato reduced-motion,
  preservazione listener pausa in P9, firma esatta di `imm-report-btn` in P5,
  testi italiani senza refusi.

Finding bloccanti → retry del builder proprietario (max 2). Contestazioni → arbitro.

## Verifica runtime raccomandata (controllo o reviewer dedicato)

`pnpm dev` + Chrome di sistema: scroll completo della home (Lenis attivo) e verifica:
1. la home apre sulla scena solare col finto header;
2. ogni scena riscritta si attraversa senza errori console;
3. la chat WhatsApp compare in Integrazioni;
4. chiusura = solo GM SOLAR + bottone.
Screenshot per scena in `docs/roadmap-migliorie/_screens/fase2/` (cartella usa-e-getta,
non committarla: aggiungi il path a `.git/info/exclude` se serve).

## GATE di uscita Fase 2

- [ ] 7 report success; scope check ok; controllo verde; reviewer PASS.
- Commit: `git add -A; git commit -m "fase 2: riscrittura scene home (P3,P4,P5,P7,P8,P9,P10)"; git tag roadmap-fase-2-ok`

## Failure mode

| Sintomo | Azione |
|---|---|
| Conflitto: due builder toccano shared.tsx | Nessun builder di F2 ne ha la proprietà → reverta e retry con richiamo all'ownership |
| P4: rete bloccata | fallback placeholder generati (vedi note B-P4) |
| P3: seek lagga | verifica che il src sia ancora `/assets/solar-twin.mp4` (derivato all-keyframe). NON accettare re-encode di nuovi video senza `-g 1 -keyint_min 1 -sc_threshold 0` |
| P9: listener pausa perso | retry B-P9 (criterio esplicito nelle sue note) |
| typecheck rosso su file di un altro builder | il controllo attribuisce col diff; retry del proprietario |
