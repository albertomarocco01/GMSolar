# Registro Ricerche Web — Vetrina Servizi

> Generato e mantenuto da Code Maniac · 2026-06-28. Fatti esterni verificati sul web, **con scadenza**. Peer di `DEBITO-TECNICO.md` ma con semantica di *recency*. Alimentato dal comando `research` e dagli anchor automatici (init, aggiunta dipendenze, scelte in domini veloci). Vedi `references/ricerca-web.md`.

## Come si legge

- **Verdetto:** la conclusione operativa (X attuale / deprecato / sostituito da Y).
- **Fonti:** URL — doc ufficiale > blog manutentore > secondario.
- **Recency:** data della fonte più recente. Sotto i ~12 mesi per i domini veloci, altrimenti `STALE`.
- **Stato:** `confermato` (verificato sul web) · `da-verificare` (deciso sul cutoff o ricerca non riuscita).

## Registro

| # | Domanda | Verdetto | Fonti (URL) | Recency | Rischio / gap | Stato |
|---|---|---|---|---|---|---|
| 1 | Next.js 16.2.x è attuale (giu 2026)? | **Attuale** — Next 16 è il major stabile corrente | nextjs.org/blog/next-16 | 2026 | nessuno | confermato |
| 2 | React 19.2.x attuale? | **Attuale** — release corrente, dep stabile di Next 16 | nextjs.org (Next 16 deps) | 2026 | nessuno | confermato |
| 3 | Tailwind CSS v4 attuale? | **Attuale** — stabile, CSS-first (`@theme`, no config JS) | tailwindcss.com/docs/guides/nextjs | 2026 | nessuno | confermato |
| 4 | Geist + Geist Mono: via consigliata in Next/React 2026? | **Sì** — pacchetto npm `geist` (`geist/font/sans`, `geist/font/mono`); integra con `next/font` | npmjs.com/package/geist · vercel.com/font · nextjs.org/docs/app/getting-started/fonts | 2026 | nessuno | confermato |
| 5 | Palette d'identità di cavoperfetto.it (+ /shop) in HEX | **Non estraibile via web** — WordPress/WooCommerce con CSS in bundle esterni non fetchabili (HTML→markdown perde gli stylesheet) | cavoperfetto.it (fetch riuscito ma senza HEX) | 2026-06 | serve DevTools/CSS diretto; fallback = token attuali (già brand-derived) | da-verificare |
| 6 | Palette d'identità di gmobility.it in HEX (viola+verde) | **Non estraibile via web** — il sito blocca il bot (`Socket is closed`, anti-bot CDN) | gmobility.it (3 fetch bloccati) | 2026-06 | manca il **viola** nei token attuali; serve HEX reale | da-verificare |

## Assunzioni da verificare (decise sul cutoff / fallback)

- **Palette di riferimento (#5, #6):** finché non arrivano gli HEX esatti, la **baseline è la palette
  già nei token** (`packages/tokens/tokens.css`), estratta in passato dai loghi reali via
  `tools/extract-logo-colors.mjs`: famiglia lime/verde (gruppo `#84cc16`, solar `#a8d920`, mobility
  `#3c9e3a`, shop `#c8d400`). **Gap confermato:** GMobility nell'identità reale usa **viola + verde**,
  ma i token hanno solo il verde → il viola va aggiunto. **DECISO (2026-06-28):** si parte con la
  **baseline + un viola GMobility scelto da noi** (coerente con verde+viola del brand), con swap agli
  HEX reali quando arrivano da DevTools. Il viola lo fisso in F1 (Fondazione) come token dedicato.
- **Anchor futuri — NON più necessari (decisione 2026-06-28):** la demo è **tutta finta**, nessuna
  AI né integrazione reale. Quindi cadono le ricerche su Vercel AI SDK (assistente) e su WhatsApp
  Cloud API / Resend (integrazioni): tutto è simulato in locale. Riaprire SOLO se il cliente chiede
  di promuovere la demo a prodotto reale.
