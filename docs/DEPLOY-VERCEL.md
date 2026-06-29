# Deploy su Vercel

Guida per pubblicare la demo **Vetrina Servizi** su Vercel. Il repo è un monorepo
pnpm + Turborepo con **una sola app** Next.js in `apps/web`; i `packages/*` sono
sorgente TS condiviso, compilati al volo via `transpilePackages` (nessuno step di
build separato). La demo è **mock**: l'AI è disattivata via codice e **non serve
nessuna variabile d'ambiente** per farla girare.

## TL;DR

1. Importa il repo su Vercel.
2. **Root Directory → `apps/web`** (unico passo manuale che conta).
3. Lascia install/build/output in auto-detect e premi **Deploy**.

---

## 1. Import del progetto

Da [vercel.com/new](https://vercel.com/new) collega il repository Git.

Vercel rileva da solo:

- **Package manager**: pnpm (dal campo `packageManager` in `package.json` e dal
  `pnpm-lock.yaml`).
- **Framework**: Next.js.
- **Monorepo**: installa le dipendenze dalla radice del workspace, così i pacchetti
  `workspace:*` (`@gmgroup/ui`, `@gmgroup/lib`, `@gmgroup/tokens`, `@gmgroup/config`)
  si risolvono correttamente.

## 2. Root Directory (importante)

Nelle impostazioni del progetto imposta:

| Campo              | Valore       |
| ------------------ | ------------ |
| **Root Directory** | `apps/web`   |

È l'unica configurazione davvero necessaria: dice a Vercel quale app del monorepo
buildare. Con questo, install e build vengono rilevati in automatico:

- **Install Command**: `pnpm install` (eseguito sulla radice del workspace).
- **Build Command**: `next build` (script `build` di `apps/web`).
- **Output Directory**: `.next` (default Next.js).

> Non serve toccarli: `apps/web/vercel.json` fissa già `framework: nextjs` e la
> region `fra1` (Francoforte, bassa latenza per l'Italia).

## 3. Versione di Node

Next 16 richiede **Node ≥ 20.9**. Il `engines.node` (`">=20.9.0"`) è dichiarato sia
in `package.json` radice sia in `apps/web/package.json`. Il default di Vercel
(**Node 22.x**) lo soddisfa: di norma non c'è nulla da impostare. Se vuoi fissarlo,
**Settings → Node.js Version → 22.x**.

## 4. Variabili d'ambiente

**Nessuna è obbligatoria.** La demo funziona out-of-the-box. Tutte opzionali:

| Variabile                       | A cosa serve                                                                 | Demo |
| ------------------------------- | ---------------------------------------------------------------------------- | ---- |
| `NEXT_PUBLIC_SITE_URL`          | URL canonico per `metadataBase`, OpenGraph, `sitemap.xml`, `robots.txt`.     | Opzionale |
| `AI_API_KEY` / `AI_PROVIDER` / `AI_MODEL` | Provider AI reale.                                                 | **Non impostare** |
| `OCM_API_KEY`, `NEXT_PUBLIC_MAP_*` | Open Charge Map / tiles mappe.                                            | Non usate |

Note:

- **`NEXT_PUBLIC_SITE_URL`**: se non la imposti, in produzione l'app usa in automatico
  `VERCEL_PROJECT_PRODUCTION_URL` (il dominio di produzione Vercel). Impostala solo
  quando colleghi un **dominio custom**, col valore assoluto (es.
  `https://vetrina.example.com`).
- **AI disattivata per scelta**: `resolveAiProvider()` in `apps/web/lib/ai.ts` ritorna
  sempre `null`. Impostare `AI_API_KEY` **non** riattiva nulla e nessun provider esterno
  viene mai contattato — è una demo deterministica. Per riattivare l'AI reale serve una
  modifica al codice (vedi storico git), non solo la variabile.

## 5. Preview e produzione

- Ogni push su un branch genera un **Preview Deployment**; il merge sul branch di
  produzione (`main`) aggiorna la **Production**.
- Le 2 route API (`/api/assistant`, `/api/gestionale`) sono **Serverless Functions**
  Node.js (`runtime = "nodejs"`, `maxDuration = 30`). Restano comunque nel fallback
  deterministico: nessuna chiave necessaria.

## 6. Deploy da CLI (alternativa)

```bash
# dalla radice del repo
pnpm dlx vercel        # primo deploy / preview (chiede Root Directory = apps/web)
pnpm dlx vercel --prod # promozione in produzione
```

---

## Checklist di verifica locale (già superata)

Prima del deploy questi comandi devono passare — replicano ciò che fa Vercel:

```bash
pnpm install --frozen-lockfile   # come l'install CI di Vercel
pnpm --filter @gmgroup/web typecheck
pnpm --filter @gmgroup/web build
```
