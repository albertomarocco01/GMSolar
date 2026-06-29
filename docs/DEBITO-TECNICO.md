# Debito Tecnico — Vetrina Servizi

> Generato e mantenuto da Code Maniac · 2026-06-28. Registro delle scorciatoie e dei residui, così *"dopo"* non diventa *"mai"*. Alimentato da `scan` (complessità; knip/jscpd/depcruise da installare), dai marcatori `ponytail:` e dalle deroghe motivate alla costituzione.

> **Aggiornamento 2026-06-29 (decommission 3-mondi):** rimosso tutto il codice del vecchio progetto "3 siti vetrina" — cartella `legacy/`, `ev-cable-advisor/`, scene 3D `vetrina3d/`, moduli home, `WORLDS`/`DEMOS`/`LOGOS`, token e asset di brand, deps 3D/mappa (three/R3F/maplibre). Di conseguenza i debiti che puntavano a file ora cancellati sono **chiusi/moot**: #1–#5 e #14 (file in `solar/`, `mobility/agent/`, `cable-finder/`, `demos/`), #10 e #16 (`WORLDS`/`LOGOS` de-brandizzati e rimossi), #13 (i "mondi-esempio" brand non esistono più). #15 (recharts SSR) risolto dal bug-finder.

## Come si legge

- **Origine:** chi ha segnalato il debito (tool o decisione).
- **Destinazione:** dove deve andare a finire (refactor previsto), non solo "è sbagliato".
- Un debito **dichiarato** non va propagato nei file nuovi né "sistemato di passaggio" (regola §0).

## Registro

| # | Debito | Origine | Destinazione | Priorità |
|---|---|---|---|---|
| 1 | Hotspot: `solar/lead/LeadQualifierApp.tsx:120 processMessageFlow` — cognitive/CCN 32, 131 nloc | scan §complessità | spezzare in step (state machine?) durante F3a | alta |
| 2 | Hotspot: `api/cable-finder/providers.ts:221 runAnthropic` — CCN 31, 98 nloc | scan §complessità | estrarre parsing/tool-calling in funzioni in F4d | alta |
| 3 | Hotspot: `mobility/agent/DeviceSimulator.tsx:42 DeviceSimulator` — **533 nloc, 15 parametri** | scan §complessità | refactor dedicato: props→oggetto config, split sotto-componenti in F3f | alta |
| 4 | Hotspot: `mobility/agent/EvAgentApp.tsx:200 handleUserMessage` — CCN 23, 70 nloc | scan §complessità | estrarre handler per intent in F3f | media |
| 5 | Hotspot: `components/demos/TourPlayer.tsx:160 (anon)` — CCN 21, 58 nloc | scan §complessità | estrarre callback in F4 (polish tour) | media |
| 6 | Altri 45 issue + 12 warn di complessità (lizard) | scan §complessità | ridurre opportunisticamente nelle fasi che li toccano, non "di passaggio" | bassa |
| 7 | Molti file non formattati (Prettier `--check` fallisce) | scan/prettier | `pnpm format` una-tantum prima della prima fase | bassa |
| 8 | Tool deterministici non installati: eslint(runner)/tsc(runner)/knip/jscpd/dependency-cruiser/semgrep/gitleaks | scan (skip) | `node <skill>/scripts/setup.mjs --tools` per attivare il motore completo | media |
| 9 | graphify non attivo nell'ambiente | init | installare per `explore` a basso costo token (degradazione: Grep/Glob) | bassa |
| 10 | Naming/branding GM ovunque (`@gmgroup/*`, `GROUP`, `WORLDS`, JSON-LD, loghi `assets.ts`) | decisione commessa (de-brand) | neutralizzare nella shell/registry in F1; i package name restano (refactor non necessario) o si rinominano in refactor dedicato | media |
| 11 | Placeholder ereditati: asset video/foto, coordinate Solar, email footer, header sborda ≤390px | NOTES-shared.md | swap asset reali a fine corsa; fix header in F1 (shell) | bassa |
| 12 | `lib/ai.ts` e `cable-finder/providers.ts` duplicano `resolveProvider` (duplicazione voluta) | NOTES-shared (fase 7) | unificare solo se tocchi entrambe in F4d; altrimenti lasciare | bassa |
| 13 | I mondi-esempio (solar/mobility/shop) tengono il nome brand (GM Solar/GMobility/Cavo Perfetto) come **contenuto d'esempio** | decisione F4 (descope F3a) | sostituibile con nomi neutri se il cliente lo chiede; non bloccante (sono esempi di "sito vetrina") | bassa |
| 14 | `DeviceSimulator` (533 nloc, 15 param) e gli altri hotspot di complessità NON refattorizzati | descope F3f | refactor dedicato quando si tocca `/mobility/agent` | media |
| 15 | Warning recharts SSR "width(-1)/height(-1)" in prerender di /dashboard e /gestionale | build | cosmetico (ResponsiveContainer misura 0 in SSR); eventualmente dare min-height ai container | bassa |
| 16 | `World.logo` (LOGOS) ora è dato morto: nessun componente renderizza loghi (vincolo "niente loghi") | F4 | rimuovere il campo `logo` da `World` + `LOGOS` in un refactor di pulizia | bassa |
| 17 | Badge di stato in dashboard/segnalazioni/gestionale usano palette Tailwind semantica (emerald/amber/rose…) invece dei token | demo (come fa analytics) | accettato: sono colori-convenzione di stato, non brand | bassa |

## Scorciatoie `ponytail:` aperte

Nessuna ancora marcata in questa codebase (la convenzione `ponytail:` parte con le nuove fasi).
Marcare ogni semplificazione deliberata con `// ponytail: <motivo + ceiling/upgrade path>`.

## Deroghe alla costituzione

| Regola derogata | Dove | Perché | Rientro previsto |
|---|---|---|---|
| 6 Minimalismo (mock vs reale) | dashboard/telemetria/gestionale/segnalazioni | è una DEMO: backend reale = over-build non richiesto | promozione a reale solo se il cliente acquista |
| ordine 4↔5 (a11y sopra type-safety) — CONFERMATA 2026-06-28 | tutto il progetto | demo che si guarda su mobile: a11y/motion contano più del rigore di tipi | rivalutare se il progetto diventa prodotto reale |

> Le regole 1 (correttezza) e 2 (sicurezza) NON sono derogabili: non compaiono mai qui.
