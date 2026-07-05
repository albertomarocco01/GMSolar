# Roadmap B — Immagini reali (Dashboard + Segnalazioni) 🟡 Medio

> **Modello consigliato:** Sonnet 5 (`claude-sonnet-5`) · **Effort:** medium
> **Prerequisiti:** nessuno. **Isolata** (tocca solo Dashboard + Segnalazioni) → può girare in
> parallelo con A e C. **Non committare.** Repo: `c:\Users\sinog\Desktop\GMSolar` (Windows/PowerShell).

Due scene devono usare **foto vere** al posto di emoji e di placeholder grigi/gradient.

## Contesto minimo

- Scene immersive in `apps/web/components/home/immersive/`, kit in `shared.tsx` (helper:
  `useImmersiveScene`, `Say`/`say`, `cursorTo`, `maskReveal`, camera…; reduced-motion → `tl.progress(1)`
  con stato finale leggibile). Tema chiaro, token, UI italiana, mock deterministici, demo solo PC.
- **Foto placeholder GIÀ NEL REPO** (`apps/web/public/assets/products/`): `cavo-01.jpg` …
  `cavo-06.jpg`, `wallbox-detail.jpg`. Sono le **stesse** che la scena `ImmersiveAssistente` usa
  quando «l'AI consiglia i prodotti» → riusale, così Dashboard e vetrina combaciano (richiesta utente).
- GSAP solo da `@gmgroup/lib/gsap`. **Non** toccare `packages/**`.

## FILE DI TUA PROPRIETÀ

- `apps/web/components/home/immersive/ImmersiveDashboard.tsx` (item 6)
- `apps/web/components/home/immersive/ImmersiveSegnalazioni.tsx` (item 7)
- `apps/web/public/assets/products/` — puoi **aggiungere** foto qui se ti servono 1–2 immagini
  a tema fotovoltaico (vedi item 6). `WebFetch` è permesso senza conferma.

---

## Item 6 — Dashboard: foto prodotti vere, via le emoji

**Cosa non va** (`ImmersiveDashboard.tsx`):
- `PRODOTTI_INIT` usa **emoji** come `ico`: `🔌 ⚡ ☀️ 🔆 🛠️`; la card «Batteria 10 kWh» usa `🔋`
  (~riga 570). Renderizzate in un quadratino `h-8 w-8`.
- Il beat «Contenuti» usa **gradient finti** come «foto» (`GRAD_FOTO_ATTUALE`, `GRAD_FOTO_NUOVA`,
  `GRAD_THUMB`) invece di immagini reali.

**Fai così:**

1. **Catalogo prodotti** (griglia 3 col, `PRODOTTI_INIT` + card «Batteria»): sostituisci il
   quadratino-emoji con una **foto** `object-cover`. Mappa deterministica alle foto esistenti, es.:
   - «Cavo Type 2 · 5 m» → `cavo-01.jpg`
   - «Wallbox 22 kW» → `wallbox-detail.jpg`
   - «Batteria 10 kWh» → `cavo-05.jpg` (o altra a scelta)
   - «Pannello 400 W» / «Inverter 6 kW» / «Kit staffe tetto» → non esistono foto fotovoltaico:
     **o** riusa crop di `cavo-0X.jpg`, **o** (meglio, se hai rete) scarica 2 placeholder Unsplash
     a tema pannelli/inverter in `products/` (`?w=400&q=75&fm=jpg`, ≤150 KB, nomi `pannello-01.jpg`,
     `inverter-01.jpg`). Cambia il tipo di `PRODOTTI_INIT`: da `ico: string` (emoji) a
     `img: string` (path). Aggiorna il render: il quadratino `h-8 w-8 … text-base` diventa un
     `<img src={p.img} alt="" loading="lazy" decoding="async" className="h-10 w-full rounded-lg object-cover" />`
     (allarga un filo la card se serve). Stessa cosa per la card «Batteria» col suo `🔋`.
2. **Beat «Contenuti»** (editor «Hero homepage»): la «foto attuale» e la «foto nuova» (wipe
   `maskReveal` con filename «impianto-2026.jpg») diventano **immagini reali**. Usa una foto
   coerente col fotovoltaico: se hai scaricato `pannello-01.jpg` usala come «nuova»; altrimenti
   `wallbox-detail.jpg`. La «attuale» e la «nuova» devono essere **diverse a colpo d'occhio** (il
   wipe di sostituzione si deve vedere) → due foto diverse, non la stessa. Le thumb della lista
   «Pagine del sito» (`GRAD_THUMB`) → foto piccole `object-cover`.
3. **Via ogni emoji** dal file. `rg "🔌|⚡|☀|🔆|🛠|🔋" apps/web/components/home/immersive/ImmersiveDashboard.tsx` → zero.
4. Non cambiare la **regia** (nav, pan tra pannelli, typing, publish, toast, bottone «Segnala un
   problema», il cursore che ci finisce sopra a fine scena). Solo gli asset visivi cambiano.
5. **Reduced-motion** (`progress(1)`): editor con la foto nuova + titolo nuovo, catalogo con foto,
   tutto leggibile. Le `<img>` non rompono `progress(1)` (sono statiche).

**Laziness note:** riusa le foto esistenti il più possibile; scarica solo se un fotovoltaico è
proprio necessario. Non introdurre `next/image` (la home usa `<img>` semplici altrove): resta `<img>`.

**Accettazione item 6:** catalogo e beat contenuti mostrano **foto** riconoscibili (le stesse del
capitolo Assistente), zero emoji; il wipe «sostituisci immagine» mostra due foto diverse.

---

## Item 7 — Segnalazioni: lo stato «immagine rotta» non deve essere brutto

**Contesto (importante — è VOLUTO, non un bug):** in `ImmersiveSegnalazioni.tsx` la card «Hero
homepage» mostra di proposito un'**immagine rotta** — riquadro grigio + icona `ImageOff` (lucide)
+ badge rosso «Immagine non trovata» (~righe 305–315). È il **difetto** che la scena poi
**risolve** (il fix finale sostituisce l'immagine rotta con quella giusta via `maskReveal`,
`GRAD_FOTO_FIX`). L'utente dice che quel riquadro «immagine non disponibile» è **brutto**. Non va
**rimosso** (spezzerebbe la storia difetto → fix): va reso **pulito e credibile**, coerente con le
foto vere del resto della demo (item 6).

**Fai così:**

1. **Stato «rotto» più curato.** Al posto del box grigio anonimo + icona spezzata, usa la **foto
   reale** della hero ma resa chiaramente «non caricata»: foto in `object-cover` con overlay
   `bg-surface-2/80` + `backdrop-grayscale`, e un **chip discreto** in basso (non un badge rosso
   sparato) tipo `bg-background/90 border-border text-muted` con icona `ImageOff` piccola e testo
   «Immagine non disponibile». Deve leggersi come «questa immagine è rotta sul sito», non come un
   404 di sistema. (Se preferisci mantenere il segnale d'errore, tieni un puntino/segnale rosso
   **piccolo**, non il badge grande.)
2. **Il fix finale** sostituisce l'overlay-difetto con la **foto nitida** (togli grayscale/overlay
   con un `maskReveal`/fade). Usa la **stessa foto** che la Dashboard pubblica come «impianto-2026.jpg»
   (item 6) → continuità: se in item 6 hai usato `pannello-01.jpg`/`wallbox-detail.jpg`, usa quella
   qui come stato «risolto». `GRAD_FOTO_FIX` (gradient) → **foto reale**.
3. **Reduced-motion** (`progress(1)`): difetto **risolto** visibile → foto nitida, badge/chip
   «Risolta ✓». Nessun elemento a metà.
4. Non toccare il resto della regia (bottone «Segnala un problema», campo «Pagina» precompilato
   con «Rilevata in automatico», invio, flip stato «In lavorazione» → «Risolta ✓»).

**Coordinamento con item 6:** entrambe le scene devono puntare alla **stessa** foto per la hero
(la «impianto-2026.jpg» pubblicata nella Dashboard = la «risolta» in Segnalazioni). Decidi UN path
e usalo in tutte e due (sei tu il proprietario di entrambi i file: tienili allineati).

**Accettazione item 7:** lo stato «immagine rotta» è pulito e coerente con le foto reali (niente
box grigio sciatto né badge rosso sparato); il fix mostra la foto nitida; a `progress(1)` il
difetto è risolto.

---

## Chiusura roadmap B

- Se giri in autonomia esegui `pnpm typecheck` + `pnpm build` e riporta l'esito esatto; altrimenti
  lascia i comandi pesanti al controllo di fase.
- Riepiloga i file toccati (incluse le eventuali foto aggiunte in `products/`) e PASS/FAIL per item.
- Commit suggerito: `migliorie2(B): dashboard con foto prodotti reali (no emoji) + segnalazioni stato immagine pulito`
