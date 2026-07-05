# Roadmap C — Auto-scroll con curva gaussiana 🟡 Medio

> **Modello consigliato:** Sonnet 5 (`claude-sonnet-5`) · **Effort:** medium
> **Prerequisiti:** nessuno. **100% isolata** (un solo file) → può girare in parallelo con tutto.
> **Non committare.** Repo: `c:\Users\sinog\Desktop\GMSolar` (Windows/PowerShell).

**Richiesta utente (item 5):** lo scroll automatico non deve andare a **velocità costante**, ma con
una **curva gaussiana** — parte **lento**, **accelera**, e **rallenta** di nuovo — su ogni tratto tra
una scena e l'altra.

## FILE DI TUA PROPRIETÀ (solo questo)

- `apps/web/components/home/AutoScroll.tsx`

## Come funziona oggi (leggilo prima di scrivere)

`AutoScroll` avanza dentro `gsap.ticker` (un solo orologio, insieme a Lenis). Va da un **anchor**
di riposo al successivo (l'inizio di ogni `<section>` figlia di `#top`), poi una **sosta** (`DWELL_MS`)
e riparte. La velocità **attuale** (funzione `tick`, ~righe 172–194) è così:

- Due velocità base: `SPEED` (300) nel corpo scena, `FAST_SPEED` (1150) nell'**assist band**
  (l'ultimo `ASSIST_VH * innerHeight` px prima dell'anchor).
- Un inviluppo `shape = min(rampIn, rampOut)` con `rampIn` (ease-in dalla partenza) e `rampOut`
  (ease-out verso l'arrivo) larghi `LAND_ZONE` px, + un `breath` sinusoidale leggero.
- `v = max(MIN_SPEED, base * shape * breath)`; il passo è `v * dt` con **carry sub-pixel** (righe
  185–194) che **NON va toccato** (garantisce il moto sotto 1px/frame: se lo rompi, l'auto si
  inchioda a ~65px dall'anchor).

Questo dà un profilo «a due marce con smussi», non una gaussiana pulita.

## Cosa fare

Sostituisci il calcolo di **`v`** con un profilo **a campana sull'intero tratto** `from → target`,
lasciando **intatto** tutto il resto (intro gate, pausa, idle/yield, DWELL, carry sub-pixel,
clamp anti-overshoot, arrivo `ARRIVE_EPS`).

1. **Progresso normalizzato sul tratto corrente:**
   ```js
   const seg = target - from;                 // lunghezza del tratto (px)
   const p = seg > 0 ? (scroll - from) / seg : 1;   // 0 = appena partiti, 1 = all'anchor
   const pc = Math.min(1, Math.max(0, p));
   ```
2. **Campana (lento → veloce → lento).** Default semplice e simmetrico, `bell(0)=0`, `bell(0.5)=1`,
   `bell(1)=0`:
   ```js
   const bell = Math.sin(Math.PI * pc);       // campana morbida
   ```
   Variante «gaussiana» più marcata (plateau centrale più largo, code più lunghe), se preferisci
   il look della curva di Gauss:
   ```js
   const SIGMA = 0.34;
   const bell = Math.exp(-((pc - 0.5) ** 2) / (2 * SIGMA * SIGMA));  // ~0.34 ai bordi, 1 al centro
   ```
   > Con `sin(π·p)` i bordi vanno esattamente a 0 (frenata piena): il `MIN_SPEED` sotto evita lo
   > stallo. Con la gaussiana i bordi non toccano 0. Prova entrambe a runtime e scegli quella che
   > «sente» meglio; lascia la formula scelta come default e commenta l'altra.
3. **Velocità dal profilo:**
   ```js
   const PEAK_SPEED = 900;                     // nuovo knob: picco al centro del tratto
   const v = Math.max(MIN_SPEED, PEAK_SPEED * bell);
   ```
   → **Elimina** la logica a due marce: via `assistBand`/`base`/`FAST_SPEED`/`SPEED` dal calcolo
   di `v` (puoi rimuovere le costanti `SPEED`, `FAST_SPEED`, `ASSIST_VH`, e `LAND_ZONE`/`rampIn`/
   `rampOut`/`shape`/`breath` se non più usate — **cerca prima** che non siano referenziate altrove
   nel file). Aggiungi il knob `PEAK_SPEED` (e `SIGMA` se usi la gaussiana) nella sezione **Knob**
   in cima, con un commento.
4. **Non toccare** dalla riga del passo in poi: `desired = v * (min(deltaMs,50)/1000) + carry`,
   `step = floor(desired)`, il riporto `carry`, il clamp `step > dist`, `scrollTo(scroll+step)`.
   Il carry sub-pixel deve restare o l'atterraggio si blocca.

## Vincoli / trappole

- **Reduced-motion:** l'effect ritorna prima (scroll nativo) → non tocca nulla. Verifica che il tuo
  refactor non sposti codice prima del check `prefersReducedMotion()`.
- **Idle/pausa/intro gate:** restano identici. La campana è **per-tratto**: dopo la sosta su un
  anchor, il tratto successivo riparte da `p=0` (lento) → è esattamente il «lento-veloce-lento» che
  l'utente vuole, ripetuto ad ogni scena.
- **Tratti cortissimi** (anchor vicini, es. due section ravvicinate): `seg` piccolo → il picco dura
  poco; il `MIN_SPEED` evita che si impunti. Va bene così.
- **Verifica a runtime** (`pnpm dev`, 1920×1080, Chrome di sistema): l'auto deve partire dolce a
  inizio scena, prendere velocità a metà, arrivare morbido all'anchor, **senza** micro-stalli e
  **senza** scatti. Tara `PEAK_SPEED` (e `SIGMA`) finché il ritmo è cinematografico. Un giro
  completo della presentazione non deve mai bloccarsi a metà tratto.

## Chiusura roadmap C

- Se giri in autonomia esegui `pnpm typecheck` + `pnpm build` (verdi) e riporta l'esito; altrimenti
  lascia i comandi pesanti al controllo di fase. **Verifica visiva obbligatoria** (è una modifica di feel).
- Riepiloga: costanti rimosse/aggiunte, la formula scelta (sin vs gauss) e i valori finali di
  `PEAK_SPEED`/`SIGMA`.
- Commit suggerito: `migliorie2(C): auto-scroll con profilo di velocità a campana (lento-veloce-lento)`
