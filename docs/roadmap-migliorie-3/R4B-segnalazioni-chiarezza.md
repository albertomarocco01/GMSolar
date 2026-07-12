# R4B — Segnalazioni: rendere visibile CHI assiste e sistema

> Auto-contenuta. Ambiente/regole: `00-ORCHESTRATORE.md` §3–§4. Modello: **Sonnet 5, medium**.
> Prerequisito: R1 chiusa. Può girare **in parallelo a R4A** (file disgiunti).

## Obiettivo

Oggi la scena (`ImmersiveSegnalazioni.tsx`) salta da «Segnalazione ricevuta ✓» al fix già
fatto: il flip «In lavorazione → Risolta» è troppo implicito. Richiesta utente: dev'essere
CHIARO che **una persona reale prende in carico la segnalazione e la sistema**. Il valore
venduto è l'assistenza, non il form.

## FILE DI PROPRIETÀ

- `apps/web/components/home/immersive/ImmersiveSegnalazioni.tsx` (solo questo)
- `shared.tsx`: **SOLA LETTURA**.

## Intervento — nuovo Beat ②½ «presa in carico» (tra invio e fix)

La struttura attuale ①click → ②form → ③fix resta. Si inserisce un beat tra ② e ③:

1. **Notifica di presa in carico** (nuovo elemento, pattern del toast esistente): card
   messaggio con **avatar umano** (iniziali «MB» su disco accent o foto placeholder
   locale, NIENTE asset esterni), nome e ruolo — es. «Marco · Assistenza tecnica» — e
   testo breve: «Ci penso io: sto sistemando l'immagine della hero.» Entra dopo il toast
   di ricezione, camera che la inquadra (`cameraTo`), hold di lettura ~1s.
2. **Timeline di stato a 3 tappe** dentro il toast/card di stato (sostituisce il flip
   secco a 2 stati): `Ricevuta ✓ → In lavorazione (con avatar MB) → Risolta ✓`.
   Le tappe si accendono in sequenza sul binario (dot + linea che si riempie, pattern
   `maskReveal` orizzontale). Il flip 3D esistente può restare per l'ultima tappa.
3. **Attribuzione nel fix**: il mini-toast finale diventa «Fix pubblicato da Marco ✓»
   (stessa identità del beat 1: chiude il cerchio persona→soluzione).
4. **Copy `Say` aggiornato**: la caption 2 diventa esplicita sull'assistenza umana, es.
   «Un nostro tecnico la prende in carico e la sistema: tu vedi solo il risultato.»
   (tono descrittivo come le sorelle, non markettaro).

## Vincoli specifici

- Riusa i pattern del kit già in scena (`cameraTo/cameraReset`, `maskReveal`,
  `pressButton`, toast): nessun helper nuovo, nessuna libreria.
- Scrub-safe: tutto to/fromTo deterministico; camera neutra a fine scena (regola 3 del kit).
- **Reduced-motion / `progress(1)`**: stato finale = timeline 3 tappe tutta accesa su
  «Risolta ✓», card di Marco visibile o riassunta nell'attribuzione del fix — la storia
  «qualcuno l'ha sistemata» si deve capire anche da fermo.
- Dati mock deterministici (nome/ruolo hardcoded nelle costanti in testa al file, come
  `PAGINA_RILEVATA`).
- `heightVh`: +40/60vh se il nuovo beat allunga la timeline (oggi 480).

## Accettazione

- [ ] `pnpm typecheck` + `pnpm build` verdi
- [ ] Guardando la scena senza audio si risponde "sì" a: _si capisce che una persona ha
      preso in carico e risolto?_ (verifica visiva 1920×1080, scrub completo)
- [ ] Scrub avanti/indietro senza salti; pausa globale ok
- [ ] Reduced-motion leggibile (stato finale racconta presa in carico + risoluzione)
- [ ] Nessuna modifica fuori da `ImmersiveSegnalazioni.tsx`

Commit suggerito: `feat(home): Segnalazioni — beat di presa in carico umana e timeline di stato`
