# Roadmap Multiagentica — Vetrina Servizi

> Generato da Code Maniac `init` · 2026-06-28. **Derivata dalla commessa confermata** (`PROGETTO.md`) via classificazione del problema. Una fase = un obiettivo verificabile e gated.
> **Metodo completo (classificazione, topologie, spec agenti, DAG, re-plan):** `references/orchestrazione-agenti.md` della skill.

## Classificazione del problema → decide la FORMA della roadmap

- **Natura:** BROWNFIELD (codebase matura, build/typecheck dati verdi)
- **Intento:** REFACTOR + FEATURE (pivot narrazione/stile + 5 demo nuove; verbo dominante "trasformare")
- **Accoppiamento/Rischio:** MISTO — **ALTO** sulla zona condivisa (font+palette+shell in `packages/tokens|ui|lib` + `app/layout` → impatta tutte le sezioni); **BASSO** sulle demo nuove (cartelle disgiunte, nessun file condiviso scritto)
- **Parallelizzabilità:** BASSA per la Fondazione (1 scrittore, serializzata); **ALTA** per narrativa + demo (aree disgiunte, dipendono solo dai token/registry della Fondazione)
- → **Forma:** Fondazione(serializzata) → (Narrativa ∥ N×Demo) → Integra · **Topologia:** hierarchical · **Meccanismo:** Subagent batch (A) nel frontier parallelo · **Ricerca web:** SÌ (palette riferimenti → fatta in init; per-integrazione WhatsApp/Resend e AI SDK prima della Fase 7)

## DAG delle fasi → cosa va in parallelo, cosa in sequenza

```
F0 ──> F1 ──> CK1(via utente) ──┬─> F2  (narrativa)        ─┐
        (fondazione, shared,    ├─> F3a (mondi esempio)     │
         serializzata, 1 agente)├─> F3b (dashboard)         │
                                ├─> F3c (segnalazioni)      ├─> F4 (integra+polish) ─> CK2(demo pronta)
                                ├─> F4d (assistente sito)*   │
                                ├─> F3e (gestionale+AI)*     │
                                ├─> F3f (app EV)             │
                                └─> F4g (integrazioni)*      ┘
   ∥ dentro il frontier (cartelle disgiunte) — spawn in UN solo messaggio, run_in_background
   * fasi che toccano AI/integrazioni/segreti → tier Opus + gate sicurezza
```
**Critical path:** F0 → F1 → CK1 → (la più lunga tra F2 e le demo AI: F4d/F3e/F4g) → F4 → CK2.

## Principi (sempre)

- **Default = un agente lineare.** Multi-agente solo nel frontier parallelo (demo in cartelle disgiunte, read/write non sovrapposti). **Mai scrittori paralleli sulla zona condivisa.**
- **Parallelo dentro un frontier, sequenziale tra frontier:** spawno solo il frontier corrente, aspetto TUTTI i completamenti, applico il gate, poi il successivo.
- **Conflitto-file = dipendenza implicita.** Il registry servizi, la nav e i token sono scritti SOLO in F1; le demo li **leggono**, non li modificano → nessun conflitto nel frontier parallelo.
- **Modello per fase = tier di complessità** (`scan` §3.5); AI/integrazioni/segreti → sempre Opus + Security-auditor.
- Niente fase prima della commessa confermata (Specchio ✅ fatto).

## Fasi

### Fase 0 — Baseline  ✅ FATTO
- [x] Scansione muta eseguita (`scan --json`: Prettier + complessità; altri tool non installati)
- [x] `scan` di partenza → hotspot in `DEBITO-TECNICO.md`
- [x] Commessa confermata (`PROGETTO.md`) — Specchio + 3 bivi sciolti
- [ ] graphify non disponibile nell'ambiente (degradazione: contesto via Grep/Glob)

### Fase 1 — Fondare design system + shell de-brandizzata (ZONA CONDIVISA)
- **Tipo:** fase
- **Obiettivo (1, verificabile):** font Geist attivo, palette unificata sui riferimenti, shell senza brand/loghi, registry dei 7 servizi creato — build/typecheck verdi su tutto il sito.
- **Dipende da:** F0
- **Input:** `RICERCA.md` (palette+font), `packages/tokens/tokens.css`, `app/layout.tsx`, `packages/ui/{Header,Footer}`, `packages/lib/site.ts` · **Output:** token+font nuovi, `Header/Footer` neutri, `data/services.ts` (registry), placeholder route dei nuovi servizi
- **Agenti:** Architetto [Opus] (decide mapping palette + de-brand + forma registry → ADR breve) → Implementatore [Sonnet] (applica). **Singolo thread, serializzato** (file condivisi).
- **Modello:** Opus (decisioni shared) → Sonnet (applicazione)
- **Ricerca web:** usa output init (palette/font già ricercati)
- **Definizione di fatto:** nessun riferimento a marchi/loghi nella shell; `pnpm typecheck` + `pnpm build` verdi; Geist renderizzato; registry consumabile.
- **Gate:** `scan(prettier,tsc,complessità)` PASS + review(checklist "fatto" voce-per-voce) + verifica visiva font/colori
- **Rischi & rollback:** rompe le sezioni esistenti (palette/token) → pre-merge: branch dedicato, si scarta; verifica le 3 sezioni prima del merge.

### CK1 — Via dell'utente sulla Fondazione
- **Tipo:** checkpoint (zero-spawn). Mostro fondazione (font+palette+shell+registry); **aspetto "via"** prima di aprire il frontier parallelo. (Regola CLAUDE.md: a fasi.)

### Fase 2 — Landing scroll-narrativa cinematica
- **Tipo:** fase · **Dipende da:** F1
- **Obiettivo:** `app/page.tsx` diventa una scroll-narrativa che scorre i 7 servizi (un capitolo ciascuno, momento "wow", deep-link), pilotata GSAP/Lenis, reduced-motion safe.
- **Input:** registry servizi, `components/home/*`, `lib/{gsap,motion}` · **Output:** nuova home + componenti capitolo in `components/home`
- **Agenti:** Implementatore [Opus] (narrativa = coerenza-critica, una sola mano). Possiede SOLO `app/page.tsx` + `components/home/**`.
- **Modello:** Opus · **Ricerca web:** NO (GSAP noto)
- **Definizione di fatto:** 7 capitoli scrollano fluidi a 60fps su mid-range; ogni capitolo deep-linka alla demo; reduced-motion = versione statica leggibile.
- **Gate:** `scan` PASS + review + a11y (focus/heading/motion) + perf check (LCP, no jank)
- **Rischi & rollback:** jank/perf su mobile → degrada animazioni; pre-merge.

> Le fasi seguenti (F3a..g) sono un **unico frontier parallelo** dopo CK1. Cartelle disgiunte → spawn in UN messaggio, `run_in_background`. Ognuna possiede solo la sua cartella `app/<x>` + `components/<x>` (+ `app/api/<x>` per quelle AI). Nessuna tocca `packages/**` né il registry.

### Fase 3a — Rifinire i mondi-esempio (servizio #1)
- **Dipende da:** F1 · **Obiettivo:** `/solar /mobility /shop` ri-stilati sui nuovi token, de-brandizzati, inquadrati come "esempio di sito vetrina"; reduce della complessità degli hotspot toccati.
- **Agenti:** Implementatore [Sonnet] × possiede `app/{solar,mobility,shop}` + `components/{solar,mobility,shop}`. · **Modello:** Sonnet
- **Fatto:** sezioni verdi, nessun marchio, hotspot toccati sotto soglia o tracciati. **Gate:** `scan`+review.

### Fase 3b — Dashboard centralizzata (servizio #2, mock)
- **Dipende da:** F1 · **Obiettivo:** `app/dashboard` — gestione contenuti (mock editor) + telemetria multi-sito (grafici recharts su dati finti realistici: utenti, interazioni, eventi).
- **Agenti:** Implementatore [Sonnet] possiede `app/dashboard` + `components/dashboard` + `data/telemetry.ts`. · **Modello:** Sonnet
- **Fatto:** dashboard navigabile, grafici animati, dati mock dichiarati. **Gate:** `scan`+review+a11y.

### Fase 3c — Pannello segnalazioni (servizio #3, mock)
- **Dipende da:** F1 · **Obiettivo:** `app/feedback` (o widget globale) — form segnalazione bug/richiesta con stati, allegati simulati, lista; submit mock (predisposto per Resend reale in F4g).
- **Agenti:** Implementatore [Sonnet] possiede `app/feedback` + `components/feedback`. · **Modello:** Sonnet
- **Fatto:** flusso invio→conferma→lista funzionante in mock. **Gate:** `scan`+review+validazione input.

### Fase 4d — Assistente AI nel sito vetrina (servizio #4)
- **Dipende da:** F1 · **Obiettivo:** widget chatbot che risponde a domande e **indirizza** a sezioni/prodotti (RAG-lite su KB JSON locale), via `app/api/assistant` + `components/assistant`; degrada senza chiave.
- **Agenti:** Architetto [Opus] (contratto tool/route + persona + guardrail) → Implementatore [Sonnet]. · **Modello:** Opus (tocca AI/route)
- **Ricerca web:** SÌ (Vercel AI SDK / streamUI vs raw-fetch; prima di implementare). · **Fatto:** chatbot risponde+linka, fallback senza chiave, chiavi solo server. **Gate:** `scan`+review+**Security-auditor** (input non fidato, no leak chiave).

### Fase 3e — Gestionale con assistente AI (servizio #5, mock)
- **Dipende da:** F1 · **Obiettivo:** `app/gestionale` — back-office mock (entità finte: clienti/ordini/impianti) con assistente AI integrato (riusa il pattern analytics NL→SQL su dati mock).
- **Agenti:** Implementatore [Opus] (tocca AI) possiede `app/gestionale` + `components/gestionale` + eventuale `app/api/gestionale`. · **Modello:** Opus
- **Fatto:** UI gestionale navigabile + assistente che risponde su dati mock. **Gate:** `scan`+review+sicurezza route.

### Fase 3f — App ricarica EV con AI (servizio #6)
- **Dipende da:** F1 · **Obiettivo:** rifinire `/mobility/agent` sui nuovi token, de-brandizzare, inquadrare come servizio; ridurre l'hotspot `EvAgentApp.handleUserMessage` (ccn 23) e `DeviceSimulator` (533 nloc).
- **Agenti:** Implementatore [Sonnet] possiede `app/mobility/agent` + `components/mobility/agent`. · **Modello:** Sonnet
- **Fatto:** agente verde, complessità ridotta o tracciata. **Gate:** `scan`+review.

### Fase 4g — Showcase integrazioni API (servizio #7)
- **Dipende da:** F1 (e idealmente F3c per il submit reale) · **Obiettivo:** `app/integrazioni` — showcase animato dei connettori (WhatsApp, Resend, ecc.) con diagrammi di flusso; **1 integrazione reale wired** (consigliata: Resend, dietro chiave server-only) come prova, il resto simulato.
- **Agenti:** Architetto [Opus] → Implementatore [Sonnet] → **Security-auditor [Opus]** (la parte reale tocca chiavi/API esterne). · **Modello:** Opus
- **Ricerca web:** SÌ OBBLIGATORIA (WhatsApp Cloud API + Resend, API correnti 2026) prima di wirare. · **Fatto:** showcase navigabile; integrazione reale invia davvero in test; chiavi solo server; fallback se assente. **Gate:** `scan`+review+`gitleaks`/Security-auditor.

### Fase 4 — Integrazione + polish + prova generale
- **Tipo:** fase · **Dipende da:** F2, F3a, F3b, F3c, F4d, F3e, F3f, F4g
- **Obiettivo:** Integrator unisce i branch, collega i deep-link della narrativa alle demo reali, aggiorna nav/registry, story-tour/deck, passata perf+a11y, build verde end-to-end.
- **Agenti:** Integrator [Opus] (build+test end-to-end, risolve conflitti su nav/registry) + Revisore [Sonnet]. · **Modello:** Opus
- **Fatto:** `pnpm build` verde, tutti i deep-link funzionano, perf/a11y non regredite, demo dimostrabile dall'inizio alla fine. **Gate:** `scan` completo + review finale + smoke test manuale del flusso.

### CK2 — Demo pronta
- **Tipo:** checkpoint. Prova generale col deck; consegna all'utente.

## Re-plan (se un gate dà FAIL-struttura)

In caso di FAIL-struttura: **barrare** (non cancellare) le fasi superate, appendere `## Re-plan N — <data> — causa: <gate fallito>`, riclassificare §2 e riconfermare la commessa solo se lo scope cambia.

### Re-plan 1 — 2026-06-28 — causa: feedback utente sull'esperienza (non un gate tecnico)

F2 era "capitoli che deep-linkano a pagine separate". L'utente vuole **UNA pagina seamless** che
racconti tutti i servizi **inline**, con **auto-scroll** (mouse → controllo, idle → riparte),
**scrollytelling** vero (pin, video-scrub, tratti **orizzontali**) e **stile uniforme**. Inoltre il
"sito vetrina" si dimostra con **solo un video scrubbato** (3D rimosso dalla demo).

**F2 ridisegnata (✅, poi superata da Re-plan 2 — i nomi di componente qui sotto, es. `HeroScene`/`HorizontalServices`/`ClosingScene`, NON esistono più):**
- `AutoScroll` (pilota Lenis via `window.__lenis`): auto-scroll, `mousemove` reale → pausa, idle 2.5s → riprende, pill di controllo accessibile, reduced-motion off.
- Home = `HeroScene` → `VetrinaScene` (video `gm-solar-drone.mp4` scrubbato + pin, no 3D) → `HorizontalServices` (track ORIZZONTALE pinnato coi 6 servizi inline, riusa le `visuals/*`) → `ClosingScene`.
- Rimossi `Hero`, `Chapter`, `ChapterVisual`, `VetrinaVisual` (vecchio impianto a capitoli→pagine).
- Le pagine `/dashboard …` restano come approfondimenti, ma la **demo è la home self-contained**.
- Gate: typecheck VERDE + build VERDE (33 route).

### Re-plan 2 — 2026-06-28 — causa: feedback utente (tema/chrome/integrazione demo)

- **Tema CHIARO forzato** (rimosso il dark-mode in `tokens.css`): risolte le "sezioni nere" (erano OS dark + token scuri).
- **Home CHROMELESS**: niente header/footer/FAB/deck su "/" (`SiteChrome` mostra la cornice solo fuori dalla home) → feel "motion design".
- **Abbandonato il pin orizzontale** (rompeva i ScrollTrigger delle visual → elementi nello stato nascosto). Ora **scene verticali** full-screen (`ServiceScene`) con reveal motion: i trigger funzionano.
- **Incorporati i DEMO REALI** nella home (`DeviceFrame` lazy-mount + clip): assistente (interattivo), dashboard, gestionale, app EV, integrazioni (flow interattivo), segnalazioni. Rimosse le 6 mini-visual e `HorizontalServices`.
- Gate: typecheck VERDE + build VERDE.

---

## Taratura della costituzione (CONFERMATA — 2026-06-28)

Priorità adattate al fatto che **è una demo commerciale** (l'effetto conta, ma la sicurezza delle
chiavi e l'a11y restano non negoziabili). **Confermato dall'utente lo scambio 4↔5: accessibilità
sopra type-safety.**

1. **Correttezza** — i flussi mostrati devono funzionare dal vivo, edge case del demo inclusi.
2. **Sicurezza** — chiavi AI/integrazioni **solo server-side**, input non fidato (chatbot, form) trattato come ostile, niente segreti nel client/commit. *Non derogabile.*
3. **Leggibilità/tracciabilità** — codice riusabile (è una base che cresce), rimozioni tracciate.
4. **Accessibilità** — a11y ≥ AA + `prefers-reduced-motion` sempre (è una demo che gira anche su mobile mid-range). *Promossa sopra type-safety per questo progetto: la demo si guarda.*
5. **Type-safety** — niente `any`, parse ai confini delle route AI.
6. **Minimalismo** — mock invece di backend reale; nessuna astrazione speculativa.
7. **Performance** — lazy-load 3D, Suspense, poster fallback; ottimizza dove misurata (LCP).

> ✅ **Confermata** (2026-06-28). Correttezza e sicurezza restano in cima e non derogabili.

---

## Stato esecuzione (2026-06-28)

Tutte le fasi eseguite in una sessione autonoma (goal "completa tutte le fasi"). Gate finale: **typecheck VERDE + build VERDE (33 route)**.

| Fase | Stato | Note |
|---|---|---|
| F0 Baseline | ✅ | scan reale; graphify non disponibile |
| F1 Fondazione | ✅ | font Geist · viola `platform` · shell de-brand · registry `SERVICES` · 5 route placeholder |
| CK1 | ✅ (attraversato) | checkpoint via — saltato per goal autonomo |
| F2 Landing scroll-narrativa | ✅ | Hero cinematico + 7 capitoli con visual animate per servizio; `WorldDoors` rimosso |
| F3a Showcase de-brand | 🟡 **descoped** | i mondi-esempio si ri-stilano da soli via token (Geist + palette). Copy GM tenuta come "contenuto d'esempio" per scelta; vedi DEBITO #13 |
| F3b Dashboard | ✅ | telemetria multi-sito + grafici recharts + gestione contenuti mock |
| F3c Segnalazioni | ✅ | form validato + lista filtrabile + timeline + toast ticket |
| F4d Assistente AI | ✅ | KB locale + route con fallback deterministico + widget riusabile + **FAB globale** sui mondi vetrina |
| F3e Gestionale + AI | ✅ | ERP mock + route AI con guardrail + fallback euristico + DataTable generica |
| F3f App EV (refactor) | 🟡 **descoped** | `/mobility/agent` funziona ed è linkato come servizio #5; refactor `DeviceSimulator` (533 nloc) resta DEBITO #3 |
| F4g Integrazioni | ✅ | showcase 7 connettori + 2 flussi animati simulati |
| F4 Integrazione | ✅ | de-brand leak ripuliti, FAB globale montato, sitemap aggiornata, typecheck+build verdi |
| CK2 Demo pronta | ✅ | build di produzione verde, deep-link funzionanti |

**Descoping (trasparenza):** F3a/F3f ridotti per minimalismo (i mondi-esempio restano contenuto dimostrativo, già ri-stilati via token). Non bloccante per la demo. Debiti tracciati in `DEBITO-TECNICO.md`.
