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
   *esempio vivo* del servizio "sito vetrina", **senza loghi e senza nomi in evidenza**.
2. **Esperienza top-level:** **scroll-narrativa cinematica** — una landing unica che scorre i
   servizi in sequenza, ognuno con un momento "wow" e deep-link a una demo interattiva.
3. **Font:** **Geist + Geist Mono** (sostituiscono Inter + Space Grotesk).

I sette servizi da raccontare:

| # | Servizio | Stato attuale nel codice |
|---|----------|--------------------------|
| 1 | Siti vetrina moderni (scrollytelling / three.js avanzato) | ✅ esiste: i 3 mondi = l'esempio |
| 2 | Dashboard centralizzata: gestione contenuti + telemetria multi-sito | ⬜ da costruire (mock) |
| 3 | Pannello segnalazioni (bug / richieste modifica) | ⬜ da costruire (mock) |
| 4 | Assistente AI nel sito vetrina (risponde, indirizza a sezioni/prodotti) | 🟡 parziale (manca il chatbot di sito) |
| 5 | Webapp gestionale con assistente AI | 🟡 solo assaggio (analytics NL→SQL) |
| 6 | App ricarica EV con assistente AI | ✅ `/mobility/agent` |
| 7 | Integrazioni API (WhatsApp, Resend, ecc.) | ⬜ da costruire (showcase animato + 1 reale) |

## A cosa serve / per chi

- **Scopo:** strumento commerciale. Convincere un cliente mostrando *capacità*, non consegnando
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

| Termine | Significato |
|---|---|
| Servizio | Una delle 7 proposte commerciali raccontate nella presentazione. |
| Capitolo | Sezione della scroll-narrativa che presenta un servizio con un momento "wow". |
| Demo / flusso | Esperienza interattiva collegata a un servizio (deep-link dal capitolo). |
| Mock | UI con dati finti realistici, senza backend reale (regola di progetto). |
| Mondo | Sito vetrina d'esempio (solar / mobility / shop), prova del servizio #1. |
| Accent / tema | Colore runtime per "zona", impostato da `ThemeProvider` via `data-theme`. |
| Token | Variabile del design system in `packages/tokens` — fonte unica di colore/tipografia/spacing. |
| Registry servizi | Dato unico che elenca i 7 servizi (per nav + landing), creato in Fondazione. |
| Degrado con grazia | Comportamento di fallback quando manca una chiave/asset: la demo resta usabile. |

## Convenzioni

Vedi `docs/convenzioni/best-practices.md` (droppato da Code Maniac). Priorità di comportamento:
correttezza > sicurezza > leggibilità/tracciabilità > type-safety > accessibilità > minimalismo >
performance (vedi taratura della costituzione in fondo a `ROADMAP-MULTIAGENTE.md`).
