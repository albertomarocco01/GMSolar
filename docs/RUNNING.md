# Come avviare il sito GM Group (guida passo-passo)

Guida a prova di principiante per far girare la demo **GM Group** sul tuo computer.
È **UN solo sito** Next.js (la cartella `apps/web`) che contiene tutti e tre i "mondi"
(Solar, Mobility, Shop) più l'hub e le 3 demo AI.

> 🟢 **Il comando che ti serve, in una riga** (dalla cartella del progetto):
> ```bash
> pnpm install && pnpm dev
> ```
> Poi apri **http://localhost:3000** nel browser. Fine.

---

## 1. Prerequisiti

| Cosa | Versione | Come verificarla |
|---|---|---|
| **Node.js** | 20 o superiore (testato su 22 e 24) | `node -v` |
| **pnpm** | 11+ (il progetto usa il packageManager `pnpm@11.6.0`) | `pnpm -v` |
| **Git** | qualsiasi recente | `git --version` |

### Installare pnpm (se `pnpm -v` dà errore)

Il modo consigliato è **corepack** (incluso in Node, niente da installare):

```bash
corepack enable
corepack prepare pnpm@11.6.0 --activate
```

In alternativa, con npm:

```bash
npm install -g pnpm
```

---

## 2. Installazione

Dalla **radice del progetto** (la cartella che contiene `pnpm-workspace.yaml`):

```bash
pnpm install
```

Installa tutto il workspace (l'app `apps/web` + i pacchetti condivisi `packages/*`) in
una volta sola. Da rifare solo quando cambiano le dipendenze.

> 💡 La chiave AI è **facoltativa** (vedi §6). Senza, il sito funziona lo stesso: le demo
> usano risposte deterministiche pre-caricate. Non serve copiare nessun file per partire.

---

## 3. Avviare il sito

### A) Tutto-in-uno (sviluppo) — consigliato

```bash
pnpm dev
```

Avvia **un solo server** Next su **http://localhost:3000**. Hot-reload attivo: salvi un
file → la pagina si aggiorna.

### B) Solo l'app (equivalente diretto)

```bash
pnpm --filter @gmgroup/web dev
```

### C) Build di produzione + avvio (per verificare il sito "come in produzione")

```bash
pnpm --filter @gmgroup/web build
pnpm --filter @gmgroup/web exec next start -p 3000
```

Poi apri **http://localhost:3000**. Questa è la modalità più stabile per fare i test.

### Controlli di qualità (facoltativi, dalla radice)

```bash
pnpm build        # build di produzione di tutto
pnpm lint         # ESLint
pnpm typecheck    # TypeScript (tsc --noEmit)
```

---

## 4. Mappa delle pagine (cosa trovi a ogni indirizzo)

Base: **http://localhost:3000**

| Indirizzo | Mondo | Cosa mostra |
|---|---|---|
| `/` | Gruppo (hub) | Landing dell'ecosistema: le tre "porte" verso i brand. |
| `/solar` | GM Solar | EPC fotovoltaico: video cinematic, stats, case study, **mappa progetti**, calcolatore ROI. |
| `/solar/lead` | GM Solar · **Demo AI** | Lead-qualifier agentico: consiglia Monofase / Trifase / Accumulo e blocca le richieste fuori tema. |
| `/solar/analytics` | GM Solar · **Demo AI** | Analytics in linguaggio naturale → SQL → grafici, con guardrail GDPR (blocca PIN/dati personali). |
| `/mobility` | GMobility | Storytelling 3D (React Three Fiber) + **mappa rete di ricarica** (Open Charge Map). |
| `/mobility/agent` | GMobility · **Demo AI** | Assistente di ricarica di bordo (mockup smartphone): costi, tempi, prenotazione stallo, guardrail. |
| `/shop` | Cavo Perfetto | E-commerce cavi: catalogo, carrello, **"trova il cavo per la tua auto"** (AI + wizard a bottoni). |
| `/shop/[id]` | Cavo Perfetto | Pagina di dettaglio prodotto (es. `/shop/modo3-t2-trifase-liscio`). |

Il tema (colore accent) cambia **da solo** in base alla pagina: lime per il gruppo,
chartreuse per Solar, verde per Mobility, lime acido per Shop.

---

## 5. Tre modi per raggiungere le 3 Demo AI

1. **Menu "✨ Demo AI" nell'header** — presente su **ogni** pagina, in alto a destra.
   Si apre con un click ed elenca le tre demo; ci si arriva da qualunque punto del sito.
2. **Sezioni in pagina** — le demo Solar sono linkate dentro `/solar`; il cable-finder è
   la sezione `#cable-finder` dentro `/shop`.
3. **Regìa di presentazione (deck)** — pensata per il colloquio: premi **`Shift+D`**
   (oppure apri una pagina con `?deck=1`, es. `http://localhost:3000/?deck=1`). Compare in
   basso una barra con le "tappe" del racconto. Naviga con **Avanti/Indietro** o con le
   frecce **←/→**. **`Esc`** la chiude. Le frecce **non** rubano i tasti mentre scrivi in un
   campo di testo.

---

## 6. AI facoltativa (chiavi, provider, modello)

> ✅ **Tutto funziona SENZA chiave.** Le 3 demo hanno un percorso deterministico (scenari
> pre-caricati + euristiche) e non si rompono mai. La chiave serve solo per far rispondere
> un vero modello a domande libere.

Per abilitare l'AI, crea il file **`apps/web/.env.local`** (è ignorato da git) partendo
dall'esempio in radice:

```bash
cp .env.local.example apps/web/.env.local
```

Poi imposta (le chiavi vivono **solo lato server**, mai nel browser):

```bash
AI_API_KEY=la-tua-chiave        # se assente → percorso deterministico
AI_PROVIDER=anthropic           # "anthropic" (default) | "gemini" | "deepseek"
AI_MODEL=                       # opzionale: override del modello di default
```

Default per provider: `claude-opus-4-8` (Anthropic), `gemini-2.0-flash` (Gemini),
`deepseek-chat` (DeepSeek). Riavvia il server dopo aver modificato `.env.local`.

Verifica veloce dello stato AI (non costa nulla, è una GET):

```bash
curl http://localhost:3000/api/lead-qualifier      # {"aiEnabled":false}  → nessuna chiave
                                                   # {"aiEnabled":true}   → chiave attiva
```

Altre chiavi facoltative (sempre solo server-side):
- **`OCM_API_KEY`** — Open Charge Map per i punti di ricarica reali su `/mobility`. Senza,
  la mappa usa un set curato di punti del Piemonte (non resta mai vuota).

---

## 7. Risoluzione problemi

### ⚠️ Porta 3000 occupata (il problema più comune)

Sul computer del proprietario gira spesso un sito personale ("Alberto Marocco.dev") che
**occupa la porta 3000**. Se è occupata, `pnpm dev` / `next start` fallisce con
**`EADDRINUSE`** — oppure, peggio, vedi il sito **sbagliato**.

**Verifica di stare guardando GM Group** (il `<title>` deve contenere "GM Group"):

```bash
curl http://localhost:3000/ | grep -i "<title>"
# Atteso: <title>GM Group — Un gruppo, tre mondi: ...</title>
```

**Trovare chi occupa la 3000 (Windows / PowerShell):**

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
# poi, se è giusto chiuderlo:
Stop-Process -Id <PID> -Force
```

**Oppure usa un'altra porta** e punta i test lì:

```bash
pnpm --filter @gmgroup/web exec next start -p 3001     # → http://localhost:3001
# in sviluppo: PORT=3001 pnpm --filter @gmgroup/web dev   (oppure -p 3001)
```

### 🗺️ "Le mappe sono vuote / nere"

Le mappe (su `/solar` e `/mobility`) si caricano **pigramente**: scrolla fino alla sezione
mappa e aspetta un paio di secondi. Sanity check:
- Deve comparire un riquadro alto (~430px) con un `<canvas>` dentro.
- Le tile della mappa arrivano da CARTO (`basemaps.cartocdn.com`) e **non** richiedono chiavi:
  servono solo connessione internet. Se sei offline, lo sfondo resta scuro ma i pin ci sono.
- I punti di `/mobility` arrivano da `/api/charging-points` (fallback curato senza
  `OCM_API_KEY`): la mappa **non resta mai senza pin**.

### 🤖 "L'AI non risponde / risponde sempre uguale"

Non è un bug: senza `AI_API_KEY` le demo usano il **percorso deterministico** (risposte
pre-caricate per gli scenari chiave + euristiche). È voluto. Per le risposte di un vero
modello, imposta la chiave (§6) e riavvia. Su `/shop` senza chiave la chat AI lascia il
posto al **wizard a bottoni** (stesso risultato, deterministico).

### 🧹 Pulire la cache (build strana, errori inspiegabili)

```bash
# cache di Next dell'app:
rm -rf apps/web/.next
# cache di Turborepo:
rm -rf .turbo apps/web/.turbo
# reinstallo pulito delle dipendenze (ultimo rimedio):
rm -rf node_modules apps/web/node_modules packages/*/node_modules && pnpm install
```

(Su Windows/PowerShell: `Remove-Item -Recurse -Force apps/web/.next, .turbo`.)

Poi ricostruisci: `pnpm build`.

---

## 8. In sintesi

- Installa: `pnpm install`
- Avvia: `pnpm dev` → **http://localhost:3000**
- Le 3 Demo AI: menu **"✨ Demo AI"** in alto, oppure deck con **`Shift+D`**.
- Funziona **senza chiavi**. La chiave AI (§6) è solo un extra.
- Se la pagina sembra un altro sito → **porta 3000 occupata** (§7).
