# FASE 3 — Segnalazioni collegata alla Dashboard (P6)

**Prompt coperti:** P6.
**Parallelismo:** 1 solo builder (tocca `page.tsx`: nessun parallelo ammesso) →
1 controllo → 1 reviewer.
**Gate d'ingresso:** tag `roadmap-fase-2-ok` (serve il bottone `imm-report-btn`
creato da P5).

## Perché fase dedicata

P6 tocca DUE file sensibili: `page.tsx` (riordino scene) e
`ImmersiveSegnalazioni.tsx` (riscrittura completa). `page.tsx` è il file più
conteso della roadmap (P1 in F1, P6 qui, KIT-12 in F5): ognuna di queste fasi lo
tocca da sola, mai in parallelo con altro.

## Ondata 1 — Builder

### B-P6 «Segnalazioni»
- **Template:** §8.1, `<k>` = 6.
- **File di proprietà:** `apps/web/app/page.tsx`,
  `apps/web/components/home/immersive/ImmersiveSegnalazioni.tsx`.
- **Note di integrazione:**
  - «P5 è già stato applicato: PRIMA di scrivere, leggi
    `ImmersiveDashboard.tsx` e copia ESATTAMENTE lo stile/markup del bottone
    `imm-report-btn` (classi, icona, testo) per la tua replica compatta della
    dashboard in Schermata A. Il report di B-P5 in `_ricognizione.md`/fase 2 ne
    riporta la firma.»
  - «Nel riordino di `page.tsx` NON cambiare altro (import inutilizzati a parte):
    l'ordine finale delle scene è: SolarTwinScene → ImmersiveAssistente →
    ImmersiveDashboard → ImmersiveSegnalazioni → ImmersiveGestionale →
    ImmersiveRicarica → ImmersiveIntegrazioni → ClosingScene.»
  - «Il pattern flip di stato (rotateY .imm-ag-old/.imm-ag-new) da riusare per
    “In lavorazione → Risolta ✓” ora vive in ImmersiveGestionale.tsx nella
    versione COLONNINE (post P7): il pattern è identico, i nomi possono differire.»

## Ondata 2 — Controllo (template §8.3)

```powershell
pnpm typecheck
pnpm build
```
Grep di accettazione (ZERO risultati):
```powershell
rg "Copia link|Anagrafica clienti|Invia per email|imm-new-btn|imm-email-toast" apps/web/components/home
```
Grep di presenza (≥1):
```powershell
rg "Rilevata in automatico|imm-report-btn" apps/web/components/home/immersive/ImmersiveSegnalazioni.tsx
rg "ImmersiveSegnalazioni" apps/web/app/page.tsx
```
Checklist statica:
- [ ] In `page.tsx` ImmersiveSegnalazioni è tra Dashboard e Gestionale.
- [ ] Campo pagina precompilato (`gmsolar.it/dashboard/contenuti` o equivalente)
      SENZA beat di copia/incolla.
- [ ] Il fix finale è visibile: badge flip + immagine sistemata + toast.
- [ ] Reduced-motion: a progress(1) si vede difetto risolto + modulo inviato.

## Ondata 3 — Reviewer (template §8.2)

Checklist specifica:
- La scena replica la dashboard in modo credibile (stessi token, non pixel-perfect).
- Nessun residuo del vecchio flusso (toolbar 3 funzioni, toast email).
- L'ordine di lettura del racconto regge scrubbando avanti/indietro (i tween del
  flip e del wipe sono deterministici; nessun say orfano).
- Scope: solo i 2 file di proprietà.

## Verifica runtime minima

`pnpm dev` + Chrome: scroll dalla Dashboard alla scena Segnalazioni; verifica
sequenza click bottone → modulo precompilato → invio → fix. Console pulita.

## GATE di uscita Fase 3

- [ ] Report success; scope ok; controllo verde; reviewer PASS.
- Commit: `git add -A; git commit -m "fase 3: segnalazioni collegata alla dashboard (P6)"; git tag roadmap-fase-3-ok`

## Failure mode

| Sintomo | Azione |
|---|---|
| AutoScroll salta gli anchor dopo il riordino | Gli anchor sono ricalcolati dai `<section>` figli di `#top`: se una scena non è più un figlio diretto section, FAIL bloccante → retry |
| Stile bottone divergente da P5 | retry B-P6 con la firma esatta estratta da ImmersiveDashboard.tsx |
