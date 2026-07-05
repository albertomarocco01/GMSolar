# Roadmap D — Camera che segue il cursore di scrittura 🔴 Difficile

> **Modello consigliato:** Opus 4.8 (`claude-opus-4-8`) · **Effort:** high
> **Prerequisiti:** eseguire **DOPO A, B ed E** (condividi `shared.tsx` con A/E e
> `ImmersiveDashboard`/`ImmersiveSegnalazioni` con B). Sei l'**ultima** roadmap.
> **Non committare.** Repo: `c:\Users\sinog\Desktop\GMSolar` (Windows/PowerShell).

**Richiesta utente (item 4):** «Sarebbe figo che quando la camera fa zoom su dove scrive, poi si
spostasse **insieme al cursore della scrittura**, come se traslasse a dx con esso.» Cioè: durante
una digitazione, la camera non fa un push-in **fermo** — **pana verso destra seguendo il caret**
che avanza, tenendolo in quadro.

## Contesto architetturale (leggi shared.tsx PRIMA di scrivere)

`apps/web/components/home/immersive/shared.tsx` è il kit. Gerarchia layer di `ImmersiveStage`:
```
.imm-stage  → .imm-camera → .imm-skew → {contenuto scena}   +  <Cursor/> (fuori da .imm-camera)
```
- **`.imm-camera`** è il layer delle inquadrature. Helper esistenti: `cameraTo`, `cameraReset`,
  `cameraFollow`, `cameraWhip`, `rackFocus`. La matematica di centraggio è in **`cameraShot()`**
  (dato un target e una scala S, ritorna `{x,y,scale}` che porta il centro del target al centro
  del viewport, con clamp ai bordi). **Riusala** — non reinventare il calcolo.
- **`typeInField(tl, target, opts)`** rivela il testo con un `clip-path` `inset(0 100%…)` → `inset(0 0%…)`
  a `steps()`, su `duration` (default 0.9). Il testo è `whitespace-nowrap`: il suo bordo destro
  visibile (il «caret») avanza da sinistra a destra durante la digitazione.
- **VINCOLO CRITICO (documentato in shared.tsx):** il cursore finto `.imm-cursor` vive **FUORI**
  da `.imm-camera`, in coordinate **schermo**. `cameraShot`/`cursorDest` misurano i target via
  `getBoundingClientRect` (coordinate schermo, transform inclusi) **assumendo di misurare a camera
  FERMA**. Regola 2 del kit: camera e cursore **non** partono simultaneamente verso lo stesso target
  (i valori function-based si valutano a tween-start). Un helper che muove camera **e** cursore
  insieme deve quindi **sincronizzarli con un unico driver**, non con due tween function-based che
  si (ri)misurano a istanti diversi.
- **Scrub-safe:** la timeline è scrubbata avanti/indietro. Niente `repeat:-1` dentro la timeline.
  A `progress(1)` (reduced-motion) la camera **deve** finire neutra → chiudi sempre con `cameraReset`.

## FILE DI TUA PROPRIETÀ

- `apps/web/components/home/immersive/shared.tsx` — **aggiungi** il nuovo helper (regione «CAMERA»,
  accanto a `cameraFollow`). Non modificare gli helper esistenti né `ChapterCard`/`CHAPTERS` (di A/E).
- Le scene dove c'è una digitazione, **solo il beat di typing**:
  - `ImmersiveDashboard.tsx` (typing del titolo hero «Energia solare per la tua azienda»)
  - `ImmersiveSegnalazioni.tsx` (typing della descrizione «L'immagine della hero non si carica»)
  - `ImmersiveGestionale.tsx` (typing della query NL, es. «colonnine offline»)
  - *(opzionale)* `ImmersiveAssistente.tsx` (typing nella barra) — solo se il push-in attuale è già lì.

## Cosa fare

### 1. Nuovo helper `cameraTrackType` in shared.tsx

Firma nello stesso stile degli altri:
```ts
cameraTrackType(
  tl,
  field,                          // il target del typeInField concorrente (selettore/Element)
  opts?: { scale?: number; duration?: number; pan?: number; ease?: string; position?: number|string }
): gsap.core.Timeline
```
Comportamento: sull'intervallo `duration` (da far coincidere col `typeInField` dello stesso campo),
la camera parte inquadrando l'**inizio** del campo e trasla verso destra fino a inquadrarne la
**fine**, a una scala `scale` (default ~1.2), tenendo il punto di scrittura (bordo destro del testo
rivelato) verso il centro. Alla fine il **caret finto** deve risultare sul punto di scrittura, non
staccato.

**Implementazione raccomandata (robusta e scrub-safe): UN driver a proxy** (stesso pattern del
proxy in `SolarTwinScene`), niente due tween function-based separati:

1. Misura a `onStart` (e su `invalidateOnRefresh`): `shot = cameraShot(section, field, S)` (centra
   il campo) e la **larghezza** del campo `w = field.getBoundingClientRect().width`.
2. Definisci due estremi di pan orizzontale della camera attorno a `shot.x`:
   - `startX = shot.x + panPx` → mostra l'**inizio** del campo (contenuto spostato a destra);
   - `endX   = shot.x - panPx` → mostra la **fine** del campo;
   dove `panPx ≈ min( (w * S) / 2 , maxX )` e `maxX` è lo stesso clamp di bordo di `cameraShot`
   (non scoprire il fondo). Se il campo è più stretto del viewport, `panPx` sarà piccolo: va bene
   (pan lieve).
3. Un tween su un proxy `{p: 0→1}` di durata `duration`, ease `opts.ease ?? "none"` (il typing è
   lineare; volendo `power1.inOut` per un respiro), `onUpdate`:
   `gsap.set(".imm-camera", { x: startX + (endX - startX) * proxy.p, y: shot.y, scale: S })`.
   Essendo pilotato dal `progress` della timeline scrubbata, è **deterministico** avanti/indietro.
4. **Caret finto in sync (l'effetto «trasla col cursore»):** porta `.imm-cursor` sullo stesso punto
   di scrittura mentre pana. Poiché il cursore è in coordinate schermo e la camera trasla il
   contenuto, il modo pulito è muoverlo **nello stesso `onUpdate`** verso la posizione **schermo**
   del bordo destro del testo rivelato: calcola la x-schermo del punto di scrittura come
   `fieldRect.left + w * S_effettiva * proxy.p` **dopo** la trasformazione camera corrente — oppure,
   più semplice e stabile: tieni il caret **fermo al centro-schermo** durante il pan (il testo scorre
   sotto di lui) impostando `.imm-cursor` a `mode:"text"` sul centro del campo e lasciandolo lì. Le
   due letture sono entrambe accettabili visivamente; **scegli quella che a scrub non fa driftare il
   caret dal testo** e documentala con un commento. (La versione «caret fermo al centro, testo che
   scorre» è la più robusta rispetto al vincolo critico del kit.)
5. **Chiudi con `cameraReset`** dopo il beat di scrittura (già previsto dalle scene: assicurati che
   il reset arrivi dopo il tuo track). A `progress(1)` la camera è neutra (la rete di sicurezza del
   kit azzera `.imm-camera`, ma **non** contarci: metti il reset esplicito).

Documenta l'helper con lo stesso stile a blocco degli altri (cosa fa, vincoli, scrub-safe).

### 2. Applicazione nelle scene

Nei beat di typing sopra elencati, **sostituisci** il push-in fermo attuale (oggi tipicamente un
`cameraTo(field, {scale:1.2, duration: ~typing})` o un `clickZoom`) con:
```
cameraTrackType(tl, "<selettore-campo>", { scale: 1.2, duration: <stessa del typeInField> });
typeInField(tl, "<selettore-campo>", { duration: <stessa>, position: "<" });   // in parallelo
```
- **Regola 4 del kit:** dove metti il track di camera, **rimuovi** il `clickZoom`/`cameraTo` fermo
  corrispondente sullo stesso beat (non si sommano).
- Mantieni le durate del track e del `typeInField` **uguali** (partono insieme, `position: "<"`).
- Le altre inquadrature della scena (whip sui cambi pannello, rack focus sui drawer, punch sui
  click) **restano** — tocchi **solo** il beat di scrittura.

## Accettazione

- In ogni scena con digitazione, mentre il testo si scrive la **camera trasla visibilmente verso
  destra seguendo il punto di scrittura** (non un semplice zoom fermo); il caret resta sul testo,
  non fluttua staccato.
- **Scrub avanti e indietro**: nessun salto, nessun offset del cursore rispetto ai target dopo il
  pan; il testo e il caret restano coerenti.
- A fine di ogni beat la camera fa `cameraReset`; a `progress(1)` (reduced-motion) la camera è
  **neutra** e il testo è interamente visibile.
- **60 fps** (pannello Performance di Chrome su un ciclo di scroll completo). Solo `transform`/`opacity`.
- Verifica visiva a 1920×1080 con Chrome di sistema.

## Chiusura roadmap D

- Se giri in autonomia esegui `pnpm typecheck` + `pnpm build` (verdi) + verifica visiva; altrimenti
  lascia i comandi pesanti al controllo di fase.
- Riepiloga: firma dell'helper, scene toccate, quale strategia del caret hai scelto (punto 4) e perché.
- Commit suggerito: `migliorie2(D): camera che segue il caret durante la digitazione (cameraTrackType)`
