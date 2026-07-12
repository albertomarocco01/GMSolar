# R2 — Motion quality: brand-identity "da After Effects"

> Auto-contenuta. Ambiente/regole: `00-ORCHESTRATORE.md` §3–§4. Modello: **Opus 4.8, high**.
> Prerequisiti: TUTTE le altre chiuse (R1, R4A, R4B, R3) — il polish si fa sul layout finale.
> Unica roadmap autorizzata a modificare il kit `shared.tsx`.

## Obiettivo

Richiesta utente: le animazioni devono avere lo stile di un **motion design di
brand-identity sviluppato in After Effects**: coerente, intenzionale, "montato". Oggi le
scene sono già scrubbate e con camera, ma il linguaggio non è unificato (mix di ease,
durate spot, ingressi senza anticipazione). Due livelli di lavoro:

## FILE DI PROPRIETÀ

- `apps/web/components/home/immersive/shared.tsx` (kit: unico punto dove nasce il linguaggio)
- Tutte le scene (`scenes/**`, `immersive/Immersive*.tsx`, `showcase/**`) per l'applicazione
- `apps/web/components/home/AutoScroll.tsx` SOLO se serve ritoccare il feel del ritmo (facoltativo)

## Livello 1 — Il linguaggio di motion (nel kit, una volta sola)

Definisci in `shared.tsx` (o modulo `motion-language.ts` accanto, se supera le soglie) le
costanti del "brand motion", ed eliminale come valori spot dalle scene:

1. **Palette di ease nominate** (3–4, non di più — un brand ha poche curve):
   - `EASE_IN_SCENE` (ingressi: expo.out o curva custom `CustomEase` equivalente a un
     ease AE 80/20), `EASE_OUT_SCENE` (uscite: power2.in), `EASE_SNAP` (micro-interazioni:
     back.out taratura unica), `EASE_CAMERA` (movimenti camera: power1.inOut, MAI back).
2. **Scala di durate** (in beat, non secondi sparsi): `DUR.micro` 0.3 · `DUR.beat` 0.6 ·
   `DUR.scene` 1.0 · `DUR.hold` 0.8. Ogni tween usa la scala (o multipli), niente 0.55/0.45/0.37 casuali.
3. **Principi di animazione codificati come helper** (i 3 che rendono "AE-grade"):
   - **Anticipazione**: micro-contromovimento (−2/−4px o scale 0.98) prima di ogni
     ingresso importante → estendi `maskReveal`/ingressi del kit con opzione `anticipate`.
   - **Overshoot & settle**: gli arrivi importanti superano di poco e rientrano (già
     back.out in alcuni punti: renderlo sistematico via `EASE_SNAP`).
   - **Azione secondaria**: ombra/glow/parallasse leggero che segue l'elemento
     principale con lag di 0.05–0.1 (helper `withShadowLag` o simile, opzionale).
4. **Grammatica di raccordo tra capitoli**: standardizza l'uscita di scena → ChapterCard
   successiva come uno "stacco di montaggio" (stessa durata e stessa curva ovunque):
   è questo che dà la sensazione di un unico film di brand.

Ponytail: SOLO ciò che le scene usano davvero. Niente helper speculativi: se un principio
non trova applicazione in almeno 2 scene, non entra nel kit.

## Livello 2 — Applicazione per scena

Per ogni capitolo (01→08 + chiusura), passa la timeline e:

- sostituisci ease/durate spot con la palette/scala (grep di accettazione sotto);
- aggiungi anticipazione agli ingressi principali (1–2 per scena, non a tappeto);
- verifica il **ritmo**: tra due beat forti ci vuole un respiro (`tl.to({}, …)` dalla
  scala `DUR.hold`) — il montaggio AE alterna accento e pausa;
- camera: SOLO `EASE_CAMERA`; controlla che punch/pull-back non si sommino a zoom locali
  (regola 4 del kit, già documentata);
- i loop decorativi (glow R4A, aloni Closing) respirano a periodo comune (es. 3.2s) così
  la pagina "respira insieme".

## Vincoli specifici

- Scrub-safe SEMPRE: to/fromTo deterministici, nessuna misura in corsa nuova.
- Reduced-motion: `progress(1)` leggibile invariato; anticipazioni/overshoot spariscono
  da soli (sono dentro i tween), verifica comunque ogni scena.
- Solo `transform`/`opacity`; 60 fps a 1920×1080 (profiling su Dashboard e showcase, le
  scene più dense).
- Se aggiungi `CustomEase`: registralo UNA volta in `@gmgroup/lib/gsap`?? NO — quella è
  zona condivisa: registralo nel kit `shared.tsx` con guardia idempotente, e annota in
  `NOTES-shared.md` la proposta di spostarlo a monte.
- API del kit: retro-compatibile (le scene si aggiornano nello stesso PR, ma niente
  rinomini gratuiti).

## Accettazione

- [ ] `pnpm typecheck` + `pnpm build` verdi
- [ ] grep nelle scene ≈ zero: `ease:\s*"(power|expo|back|sine)[^"]*"` fuori dalla
      palette nominata · `duration:\s*0\.\d+` fuori dalla scala (tolleranza: casi motivati
      con commento `// motion:`)
- [ ] Visione completa 1920×1080 in un'unica passata: gli stacchi tra capitoli hanno lo
      stesso "montaggio"; nessun beat che scatta senza anticipazione/settle dove previsto
- [ ] Scrub avanti/indietro + pausa globale + reduced-motion: tutti ok su tutte le scene
- [ ] Report: tabella scena → cosa cambiato (1 riga, caveman) + eventuali proposte per
      `NOTES-shared.md`

Commit suggerito: `feat(home): linguaggio di motion unificato (palette ease, scala durate, anticipazione/settle)`
