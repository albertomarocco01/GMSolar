"use client";

/**
 * @descrizione  Scena immersiva GESTIONALI SU MISURA (servizio 06): il messaggio
 *   è la personalizzazione; le colonnine di ricarica sono l'ESEMPIO concreto.
 *   Full-screen, alta fedeltà. IDENTITÀ VISIVA distinta dalla Dashboard (che le
 *   somigliava troppo): sidebar SCURA da console operativa, chip di stato
 *   semantiche (emerald/rose/amber — stessi minimi token di Dashboard e
 *   Segnalazioni), pannello "Stato rete" con barre colorate. REGIA a 4 beat,
 *   ritmo DISTESO (durate lunghe + pause respiro; era troppo rapido all'occhio):
 *     ⓪ Title card di capitolo (P12) — «05 · Gestionali su misura» via
 *        chapterIntro(tl), PRIMO beat.
 *     ① Panoramica — KPI con icone e trend, barre «Sessioni per giorno»,
 *        barre "Stato rete" che si riempiono. NESSUN pan.
 *     ② Colonnine — pan orizzontale; query in linguaggio naturale che filtra
 *        (typeInField + righe non-match che sfumano + evidenziazione a wipe
 *        delle 2 colonnine Offline, chip rose).
 *     ③ Assistente AI — drawer "copilot" sopra la vista Colonnine: richiesta in
 *        italiano, step con check che "poppano", le 2 colonnine flippano
 *        Offline → Online ✓ (chip emerald) e il contatore scala 2 → 0.
 *     ④ Manutenzione — il drawer si richiude, pan al terzo pannello: interventi
 *        programmati con chip di stato + uptime rete. La voce "Sessioni" resta
 *        di catalogo (vende ampiezza senza allungare la demo).
 *   Usa il kit condiviso `./shared`. Reduced-motion: tl a progress(1) → vista
 *   finale Manutenzione, colonnine Online, contatore a 0, drawer richiuso; il
 *   binario a 3 pannelli diventa un carosello scrollabile (overflow-x-auto); la
 *   ChapterCard finisce NASCOSTA → heading statico di capitolo in cima.
 *   CAMERA (P11) — shot-list: whip-pan (d) sui cambi Panoramica→Colonnine e
 *   Colonnine→Manutenzione, camera-track del caret sulla query, rack focus (e)
 *   dietro il drawer AI (chiuso da rackFocusOff al beat ④), micro-dutch 0.5°
 *   sul «Fatto», punch (a) sui flip Offline→Online ✓ e sulla lista interventi.
 *   Ogni inquadratura si chiude con cameraReset → camera NEUTRA a progress(1).
 */
import {
  Activity,
  BatteryCharging,
  History,
  LayoutDashboard,
  Wrench,
  Zap,
} from "lucide-react";
import { gsap } from "@gmgroup/lib/gsap";
import { useReducedMotion } from "@gmgroup/lib/motion";
import {
  ImmersiveStage,
  Say,
  say,
  CHAPTERS,
  ChapterCard,
  chapterIntro,
  cursorTo,
  hideCursor,
  cameraTo,
  cameraReset,
  cameraTrackType,
  cameraWhip,
  rackFocus,
  rackFocusOff,
  useImmersiveScene,
  pressButton,
  typeInField,
  maskReveal,
} from "./shared";

// Voci sidebar (con icona, look console operativa): la demo visita Panoramica,
// Colonnine e Manutenzione; "Sessioni" resta di catalogo.
const NAV = [
  { label: "Panoramica", Icon: LayoutDashboard },
  { label: "Colonnine", Icon: BatteryCharging },
  { label: "Sessioni", Icon: History },
  { label: "Manutenzione", Icon: Wrench },
];

// Chip di stato semantiche (minimi token Tailwind, come Dashboard/Segnalazioni).
const CHIP: Record<string, string> = {
  Online: "bg-emerald-100 text-emerald-700",
  Offline: "bg-rose-100 text-rose-700",
  "In manutenzione": "bg-amber-100 text-amber-700",
  Programmata: "bg-sky-100 text-sky-700",
  "In corso": "bg-amber-100 text-amber-700",
  Completata: "bg-emerald-100 text-emerald-700",
};

// KPI Panoramica: icona in bolla tinta + chip trend.
const KPI = [
  {
    v: "46",
    l: "Colonnine in rete",
    Icon: BatteryCharging,
    iconCls: "bg-accent-soft text-accent-ink",
    trend: "+2 questo mese",
    trendCls: "bg-emerald-100 text-emerald-700",
  },
  {
    v: "128",
    l: "Sessioni oggi",
    Icon: Zap,
    iconCls: "bg-sky-100 text-sky-600",
    trend: "+12% vs ieri",
    trendCls: "bg-emerald-100 text-emerald-700",
  },
  {
    v: "97%",
    l: "Disponibilità",
    Icon: Activity,
    iconCls: "bg-emerald-100 text-emerald-600",
    trend: "target 95%",
    trendCls: "bg-surface-2 text-muted",
  },
];

const SESSIONI = [45, 62, 50, 80, 68, 92, 74];
const GIORNI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

// Stato rete: totali coerenti con la tabella Colonnine (2 offline) e col KPI 46.
const RETE = [
  { l: "Online", n: 38, w: "83%", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  { l: "In manutenzione", n: 6, w: "13%", dot: "bg-amber-500", bar: "bg-amber-500" },
  { l: "Offline", n: 2, w: "4%", dot: "bg-rose-500", bar: "bg-rose-500" },
];

// Colonnine in tabella; `m` = match della query «colonnine offline».
// Le 2 match sono anche le colonnine su cui l'assistente AI opera al beat ③.
const COLONNINE = [
  { id: "COL-012 · Torino Nord", p: "150 kW", s: "Offline", m: true },
  { id: "COL-007 · Milano Est", p: "22 kW", s: "Online", m: false },
  { id: "COL-019 · Asti Centro", p: "22 kW", s: "Offline", m: true },
  { id: "COL-003 · Cuneo Sud", p: "50 kW", s: "Online", m: false },
  { id: "COL-015 · Alba", p: "22 kW", s: "In manutenzione", m: false },
];

// Le stesse 2 colonnine filtrate, dentro il pannello assistente (flip di stato
// lì: il pannello copre parte della tabella, la mini-lista resta sempre leggibile).
const FILTRATE = COLONNINE.filter((c) => c.m);

// Passi che l'assistente mostra mentre esegue. Ogni step ha un check che "poppa".
const AGENT_STEPS = [
  "Leggo le 2 colonnine offline…",
  "Invio il comando di riavvio…",
  "Verifico lo stato…",
  "Fatto",
];

// Interventi del pannello Manutenzione (beat ④).
const INTERVENTI = [
  { id: "COL-015 · Alba", t: "Sostituzione connettore CCS", q: "Oggi · 14:30", s: "In corso" },
  { id: "COL-021 · Bra", t: "Aggiornamento firmware", q: "Gio 12 · 09:00", s: "Programmata" },
  { id: "COL-008 · Alessandria", t: "Revisione semestrale", q: "Lun 16 · 10:30", s: "Programmata" },
  { id: "COL-003 · Cuneo Sud", t: "Taratura contatore", q: "Ieri · 11:00", s: "Completata" },
];

export default function ImmersiveGestionale() {
  // Reduced-motion: il binario a 3 pannelli diventa un carosello scrollabile.
  const reduced = useReducedMotion();
  const ref = useImmersiveScene((tl, section) => {
    // `() => navTop(i)`: valori FUNZIONE → ri-misurati da invalidateOnRefresh su resize.
    const navItems = Array.from(section.querySelectorAll<HTMLElement>(".imm-nav-item"));
    const navTop = (i: number) => navItems[i]?.offsetTop ?? 0;

    // Proxy per il contatore "Colonnine offline" nel footer del pannello
    // assistente: 2 → 0. (countUp del kit parte da 0 → qui serve un decremento,
    // quindi proxy inline.)
    const offline = { v: 2 };
    const offlineEl = section.querySelector<HTMLElement>(".imm-ag-kpi");

    gsap.set(".imm-badge", { autoAlpha: 0, scale: 0.8 });
    gsap.set(".imm-kpi", { autoAlpha: 0, y: 18 });
    // Barre Panoramica: crescono dal basso (scaleY); barre Stato rete: si
    // riempiono da sinistra (scaleX).
    gsap.set(".imm-pano-bar", { scaleY: 0, transformOrigin: "bottom" });
    gsap.set(".imm-net-bar", { scaleX: 0, transformOrigin: "left" });
    // Rack focus (P11): la scala 0.985 del binario deve respirare attorno al
    // pannello COLONNINE (pannello centrale del binario largo 300% → origin 50%).
    gsap.set(".imm-track", { transformOrigin: "50% 50%" });
    // Pannello assistente: parte fuori campo a destra (drawer chiuso).
    gsap.set(".imm-ag-drawer", { xPercent: 100 });
    gsap.set(".imm-ag-step", { autoAlpha: 0, y: 8 });
    gsap.set(".imm-ag-check", { scale: 0, transformOrigin: "50% 50%" });
    // Flip di stato: "Offline" gira via, "Online ✓" gira dentro (rotateY 3D).
    gsap.set(".imm-ag-old", { transformPerspective: 400, transformOrigin: "50% 50%" });
    gsap.set(".imm-ag-new", {
      autoAlpha: 0,
      rotationY: -90,
      transformPerspective: 400,
      transformOrigin: "50% 50%",
    });
    // Manutenzione (beat ④): righe e chip entrano in cascata.
    gsap.set(".imm-mant-row", { autoAlpha: 0, y: 14 });
    gsap.set(".imm-mant-chip", { scale: 0, transformOrigin: "50% 50%" });
    tl.set(".imm-nav-ind", { top: () => navTop(0) });

    // ── ⓪ Title card di capitolo (P12) — SEMPRE primo beat della timeline ────
    chapterIntro(tl);

    // ── ① Panoramica — KPI, barre sessioni, barre Stato rete. Ritmo disteso. ──
    tl.to(
      ".imm-kpi",
      { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.18, ease: "back.out(1.6)" },
      "<0.2",
    );
    tl.to(
      ".imm-pano-bar",
      { scaleY: 1, duration: 0.9, stagger: 0.12, ease: "back.out(1.5)" },
      ">-0.15",
    );
    tl.to(".imm-net-bar", { scaleX: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }, ">-0.4");
    tl.to({}, { duration: 0.5 }); // respiro: la panoramica resta leggibile

    // ── ② Colonnine + query in linguaggio naturale ────────────────────────────
    say(tl, 1);
    cursorTo(tl, navItems[1], { mode: "hand" });
    tl.to(".imm-nav-ind", { top: () => navTop(1), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -100 / 3, duration: 1.5, ease: "expo.inOut" }, "<0.1");
    // CAMERA · whip-pan (d) in sync col pan del binario: parte nel cuore del
    // movimento — DOPO che il cursore è atterrato sulla voce di nav (regola 2) —
    // e finisce neutro.
    cameraWhip(tl, "r", { position: "<0.7" });
    // CAMERA · track del caret: la camera trasla a dx seguendo il punto di
    // scrittura della query — il caret resta al centro-schermo.
    // ">0.3" = parte a binario FERMO → misura pulita. Typing LENTO (leggibile).
    cameraTrackType(tl, ".imm-query", { scale: 1.2, duration: 1.6, position: ">0.3" });
    typeInField(tl, ".imm-query", { steps: 17, duration: 1.6, position: "<" });
    // Le righe che fanno match: l'evidenziazione accent entra a WIPE (maskReveal)
    // mentre la camera si RIAPRE — pull-back all'"invio" che svela il filtro.
    tl.to(".imm-row-n", { opacity: 0.35, duration: 0.5 }, ">0.15");
    maskReveal(tl, ".imm-match", { dir: "l", duration: 0.6, stagger: 0.18, position: "<" });
    tl.to(".imm-badge", { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, "<");
    cameraReset(tl, { duration: 0.8, position: "<" });
    tl.to({}, { duration: 0.4 }); // respiro: il filtro resta in campo

    // ── ③ Assistente AI — si apre il pannello copilota ed ESEGUE l'operazione ─
    say(tl, 2);
    // Il cursore preme il bottone AI in topbar → il drawer entra da destra.
    cursorTo(tl, ".imm-ai-btn", { mode: "hand" });
    pressButton(tl, ".imm-ai-btn", {
      down: 0.9,
      downDur: 0.1,
      upDur: 0.3,
      back: 2.6,
      position: ">-0.05",
    });
    tl.to(".imm-ag-drawer", { xPercent: 0, duration: 0.9, ease: "expo.out" }, ">-0.1");
    // CAMERA · rack focus (e): mentre il drawer entra, il contenuto DIETRO
    // (binario Colonnine) perde fuoco. Riaperto da rackFocusOff al beat ④.
    rackFocus(tl, ".imm-track", { position: "<0.1" });
    // 1. la richiesta in linguaggio naturale si "scrive" (kit: typeInField)
    cursorTo(tl, ".imm-ag-req", { mode: "text" });
    typeInField(tl, ".imm-ag-req", { steps: 26, duration: 1.3, position: "<0.2" });
    // 2. l'assistente esegue: gli step compaiono e ogni check "poppa". Stagger
    //    LENTO (0.5): ogni passo si legge prima che arrivi il successivo.
    tl.to(
      ".imm-ag-step",
      { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.5, ease: "power2.out" },
      ">0.15",
    );
    tl.to(".imm-ag-check", { scale: 1, duration: 0.4, stagger: 0.5, ease: "back.out(3)" }, "<0.15");
    // CAMERA · micro-dutch 0.5° sul «Fatto» (regola 5: ≤0.6°, SEMPRE riportata
    // a 0). Sotto-timeline rotation-only in sync col pop dell'ultimo check.
    const dutch = gsap.timeline();
    dutch
      .to(".imm-camera", { rotation: 0.5, duration: 0.18, ease: "power2.out" })
      .to(".imm-camera", { rotation: 0, duration: 0.32, ease: "power2.inOut" });
    tl.add(dutch, ">-0.4");
    // 3. CAMERA · punch (a) sulla mini-lista: la camera "colpisce" mentre le 2
    //    colonnine flippano "Offline" → "Online ✓". Il cursore finto va sfumato
    //    QUI, prima del punch, così non "galleggia" staccato durante i movimenti
    //    camera-only (il prossimo cursorTo lo riporta visibile).
    hideCursor(tl, { duration: 0.3, position: ">-0.2" });
    cameraTo(tl, ".imm-ag-list", {
      scale: 1.4,
      duration: 0.45,
      ease: "back.out(1.2)",
      position: ">",
    });
    tl.to(
      ".imm-ag-old",
      { rotationY: 90, autoAlpha: 0, duration: 0.35, stagger: 0.12, ease: "power2.in" },
      "<0.15",
    );
    tl.to(
      ".imm-ag-new",
      { rotationY: 0, autoAlpha: 1, duration: 0.5, stagger: 0.12, ease: "back.out(1.4)" },
      "<0.05",
    );
    // 4. PULL-BACK e chiusura inquadratura: mentre la camera si riapre, la
    //    CONSEGUENZA sui dati — "Colonnine offline" scala 2 → 0 nel footer.
    cameraReset(tl, { duration: 0.8, position: ">0.35" });
    tl.to(
      offline,
      {
        v: 0,
        duration: 0.7,
        ease: "power2.out",
        onUpdate() {
          if (offlineEl) offlineEl.textContent = String(Math.round(offline.v));
        },
      },
      "<0.2",
    );
    tl.to({}, { duration: 0.5 }); // respiro: il risultato dell'assistente resta in campo

    // ── ④ Manutenzione — il drawer si richiude, pan al terzo pannello ────────
    say(tl, 3);
    // Drawer via + il binario torna a fuoco (chiude il rack focus del beat ③).
    tl.to(".imm-ag-drawer", { xPercent: 100, duration: 0.7, ease: "expo.in" });
    rackFocusOff(tl, ".imm-track", { position: "<0.1" });
    // Il cursore clicca la voce "Manutenzione" → pan (stesso pattern del beat ②).
    cursorTo(tl, navItems[3], { mode: "hand" });
    tl.to(".imm-nav-ind", { top: () => navTop(3), duration: 0.45, ease: "power3.inOut" }, "<0.3");
    tl.to(".imm-track", { xPercent: -200 / 3, duration: 1.5, ease: "expo.inOut" }, "<0.1");
    cameraWhip(tl, "r", { position: "<0.7" });
    // Gli interventi entrano in cascata; le chip di stato "poppano" a seguire.
    tl.to(
      ".imm-mant-row",
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.22, ease: "power3.out" },
      ">0.15",
    );
    tl.to(
      ".imm-mant-chip",
      { scale: 1, duration: 0.45, stagger: 0.22, ease: "back.out(2.2)" },
      "<0.2",
    );
    // CAMERA · punch morbido sulla lista interventi, poi chiusura neutra
    // (regola 3: camera neutra a progress(1)). Cursore sfumato prima del
    // movimento camera-only.
    hideCursor(tl, { duration: 0.3, position: ">-0.2" });
    cameraTo(tl, ".imm-mant-list", { scale: 1.2, duration: 0.7, position: ">" });
    cameraReset(tl, { duration: 0.8, position: ">0.5" });
    tl.to({}, { duration: 0.6 });
  });

  return (
    <ImmersiveStage
      ref={ref}
      heightVh={700}
      label={CHAPTERS[5].title}
      chapterIndex={5}
    >
      {/* Reduced-motion: la ChapterCard a progress(1) finisce NASCOSTA → heading
          statico di capitolo in cima, sempre leggibile (coerente col fallback
          reduced della scena: carosello scrollabile + stato finale). */}
      {reduced && (
        <h2 className="text-accent-ink absolute top-4 left-6 z-20 font-mono text-xs font-bold tracking-[0.35em] uppercase">
          {CHAPTERS[5].title}
        </h2>
      )}
      <div className="flex h-full pt-12">
        {/* Sidebar SCURA da console operativa: è il tratto visivo che distingue
            il Gestionale dalla Dashboard (sidebar chiara). */}
        <aside className="bg-foreground relative hidden w-56 shrink-0 p-4 sm:block">
          <div className="mb-6 flex items-center gap-2 px-2 font-semibold text-white">
            <span className="bg-accent h-4 w-4 rounded-[5px]" /> Gestionale
          </div>
          <nav className="relative space-y-1">
            <span
              className="imm-nav-ind pointer-events-none absolute inset-x-0 h-10 rounded-lg bg-white/10"
              style={{ top: 0 }}
              aria-hidden
            >
              {/* Tacca accent della voce attiva (leggibile sul fondo scuro) */}
              <span className="bg-accent absolute top-2 bottom-2 left-0 w-1 rounded-full" />
            </span>
            {NAV.map(({ label, Icon }) => (
              <div
                key={label}
                className="imm-nav-item relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75"
              >
                <Icon className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
                {label}
              </div>
            ))}
          </nav>
          <div className="mt-6 border-t border-white/10 px-2 pt-4">
            <p className="mb-2 text-[11px] font-semibold tracking-wider uppercase text-white/40">
              Rete
            </p>
            <div className="flex items-center gap-2 text-sm text-white/75">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              46 colonnine connesse
            </div>
          </div>
        </aside>

        {/* Reduced-motion: overflow-x-auto → binario a 3 pannelli scorribile a mano. */}
        <div
          className={`relative flex-1 ${
            reduced ? "overflow-x-auto overflow-y-hidden" : "overflow-hidden"
          }`}
        >
          <div className="border-border bg-surface/60 flex h-14 items-center gap-3 border-b px-6 backdrop-blur">
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              Rete online
            </span>
            <div className="bg-surface-2 text-muted flex h-8 max-w-md flex-1 items-center rounded-full px-4 text-sm">
              Cerca o chiedi all&apos;AI…
            </div>
            {/* Bottone che apre il pannello assistente (il cursore lo preme al beat ③) */}
            <span className="imm-ai-btn bg-accent-soft text-accent-ink flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold">
              <span className="bg-accent h-1.5 w-1.5 rounded-full" aria-hidden />
              Assistente AI
            </span>
          </div>

          <div className="imm-track flex h-[calc(100%-3.5rem)]" style={{ width: "300%" }}>
            {/* 1 · Panoramica */}
            <div className="w-1/3 shrink-0 overflow-hidden p-6">
              <div className="grid grid-cols-3 gap-4">
                {KPI.map(({ v, l, Icon, iconCls, trend, trendCls }) => (
                  <div key={l} className="imm-kpi border-border bg-surface rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconCls}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${trendCls}`}
                      >
                        {trend}
                      </span>
                    </div>
                    <p className="text-foreground font-display mt-3 text-3xl font-bold">{v}</p>
                    <p className="text-muted mt-0.5 text-sm">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_240px] gap-4">
                <div className="imm-kpi border-border bg-surface rounded-xl border p-5">
                  <p className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
                    Sessioni per giorno
                  </p>
                  <div className="flex h-28 items-end gap-3">
                    {SESSIONI.map((h, i) => (
                      <span
                        key={i}
                        className={`imm-pano-bar flex-1 rounded-t ${
                          i === 5 ? "bg-accent" : "bg-brand-200"
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 flex gap-3">
                    {GIORNI.map((g) => (
                      <span key={g} className="text-muted flex-1 text-center text-[10px]">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Stato rete: prepara la storia — 2 Offline (beat ②③) e la
                    Manutenzione (beat ④) sono già qui, a colori. */}
                <div className="imm-kpi border-border bg-surface rounded-xl border p-5">
                  <p className="text-muted mb-3 text-xs font-semibold tracking-wider uppercase">
                    Stato rete
                  </p>
                  <div className="space-y-3">
                    {RETE.map(({ l, n, w, dot, bar }) => (
                      <div key={l}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
                            {l}
                          </span>
                          <span className="text-foreground font-mono text-xs">{n}</span>
                        </div>
                        <div className="bg-surface-2 mt-1.5 h-1.5 overflow-hidden rounded-full">
                          <span
                            className={`imm-net-bar block h-full rounded-full ${bar}`}
                            style={{ width: w }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2 · Colonnine */}
            <div className="relative w-1/3 shrink-0 overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                {/* Barra query: l'enfasi sul typing è il camera-track del caret (P11). */}
                <div className="bg-surface-2 text-foreground flex h-9 max-w-sm flex-1 items-center rounded-full px-4 text-sm">
                  <span className="imm-query block whitespace-nowrap">colonnine offline</span>
                </div>
                <span className="imm-badge bg-accent text-accent-contrast ml-3 rounded-full px-3 py-1 text-xs font-semibold">
                  2 risultati
                </span>
              </div>
              <div className="border-border overflow-hidden rounded-xl border">
                <div className="bg-surface-2 text-muted grid grid-cols-3 gap-2 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                  <span>Colonnina</span>
                  <span>Potenza</span>
                  <span>Stato</span>
                </div>
                <div className="divide-border divide-y">
                  {COLONNINE.map((c, i) => (
                    <div
                      key={i}
                      className={`relative grid grid-cols-3 items-center gap-2 px-4 py-3 text-sm ${c.m ? "imm-row-m" : "imm-row-n"}`}
                    >
                      {c.m && (
                        <span className="imm-match bg-accent-soft border-accent absolute inset-0 border-l-[3px]" />
                      )}
                      <span className="text-foreground relative font-medium">{c.id}</span>
                      <span className="text-foreground relative font-mono">{c.p}</span>
                      <span className="relative">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CHIP[c.s]}`}
                        >
                          {c.s}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 · Manutenzione (beat ④): interventi programmati + uptime */}
            <div className="w-1/3 shrink-0 overflow-hidden p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold">Manutenzione programmata</p>
                  <p className="text-muted text-xs">Interventi sulla rete · prossimi 7 giorni</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  3 interventi aperti
                </span>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_230px] gap-4">
                <div className="imm-mant-list border-border overflow-hidden rounded-xl border">
                  <div className="bg-surface-2 text-muted flex items-center justify-between px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
                    <span>Intervento</span>
                    <span>Stato</span>
                  </div>
                  <div className="divide-border divide-y">
                    {INTERVENTI.map((m) => (
                      <div key={m.id} className="imm-mant-row flex items-center gap-3 px-4 py-3">
                        <span className="bg-surface-2 text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Wrench className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-medium">{m.id}</p>
                          <p className="text-muted truncate text-xs">{m.t}</p>
                        </div>
                        <span className="text-muted shrink-0 font-mono text-xs">{m.q}</span>
                        <span
                          className={`imm-mant-chip shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${CHIP[m.s]}`}
                        >
                          {m.s}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="imm-mant-row border-border bg-surface rounded-xl border p-4">
                    <p className="text-muted text-xs font-semibold tracking-wider uppercase">
                      Uptime rete · 30 gg
                    </p>
                    <p className="font-display mt-2 text-3xl font-bold text-emerald-600">99,2%</p>
                    <p className="text-muted mt-1 text-xs">obiettivo 98% superato</p>
                  </div>
                  <div className="imm-mant-row border-border bg-surface rounded-xl border p-4">
                    <p className="text-muted text-xs font-semibold tracking-wider uppercase">
                      Prossimo intervento
                    </p>
                    <p className="text-foreground mt-2 text-sm font-semibold">Oggi · 14:30</p>
                    <p className="text-muted mt-1 text-xs">COL-015 · Alba — connettore CCS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Pannello ASSISTENTE AI (drawer "copilot", sopra la vista Colonnine)
              Fuori dal track: entra da destra via xPercent, non viene pannato;
              si richiude al beat ④ (a progress(1) è fuori campo). */}
          <div className="imm-ag-drawer border-border bg-surface absolute inset-y-0 right-0 z-10 flex w-[min(420px,46%)] flex-col border-l p-5 shadow-2xl">
            <div className="text-foreground mb-4 flex items-center gap-2 font-semibold">
              <span className="bg-accent-soft text-accent-ink flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold">
                AI
              </span>
              Assistente AI
            </div>

            {/* Richiesta dell'utente in linguaggio naturale */}
            <div className="flex items-start gap-3">
              <span className="bg-surface-2 text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                TU
              </span>
              <div className="bg-surface-2 text-foreground max-w-full rounded-2xl rounded-tl-none px-4 py-2.5 text-sm">
                <span className="imm-ag-req block whitespace-nowrap">
                  «riavvia le colonnine offline»
                </span>
              </div>
            </div>

            {/* L'assistente esegue: sequenza di step operativi */}
            <ul className="mt-4 space-y-1.5">
              {AGENT_STEPS.map((s, i) => (
                <li key={i} className="imm-ag-step text-foreground flex items-center gap-2 text-sm">
                  {/* Check che "poppa" (scale 0→1) quando lo step è fatto */}
                  <span className="imm-ag-check bg-accent text-accent-contrast flex h-4 w-4 shrink-0 items-center justify-center rounded-full">
                    <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5" aria-hidden>
                      <path
                        d="m5 13 4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {s}
                </li>
              ))}
            </ul>

            {/* Le stesse 2 colonnine filtrate al beat ②: flippano Offline → Online ✓.
                `imm-ag-list` = target del PUNCH di camera (P11) sul flip. */}
            <div className="imm-ag-list border-border mt-5 overflow-hidden rounded-xl border">
              <div className="bg-surface-2 text-muted grid grid-cols-[1fr_auto_6rem] gap-3 px-4 py-2 text-xs font-semibold tracking-wider uppercase">
                <span>Colonnina</span>
                <span>Potenza</span>
                <span className="text-right">Stato</span>
              </div>
              <div className="divide-border divide-y">
                {FILTRATE.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_auto_6rem] items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="text-foreground truncate font-medium">{c.id}</span>
                    <span className="text-foreground font-mono">{c.p}</span>
                    <span className="relative flex h-6 items-center justify-end">
                      {/* stato iniziale */}
                      <span className="imm-ag-old rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                        Offline
                      </span>
                      {/* stato dopo l'azione dell'assistente */}
                      <span className="imm-ag-new absolute right-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Online ✓
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONSEGUENZA sul gestionale: il contatore di Panoramica si aggiorna */}
            <div className="bg-surface-2 mt-auto flex items-center justify-between rounded-xl px-4 py-3">
              <span className="text-muted text-xs font-semibold tracking-wider uppercase">
                Colonnine offline
              </span>
              <span className="text-accent-ink font-display text-xl font-bold tabular-nums">
                <span className="imm-ag-kpi">2</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Title card di capitolo (P12): apre la scena; animata da chapterIntro(tl).
          Le frasi successive restano caption lower-third DESCRITTIVE. */}
      <ChapterCard
        chapter={CHAPTERS[5]}
        subtitle="Un gestionale su misura per la tua attività. Per esempio: le tue colonnine di ricarica."
      />
      <Say i={1} variant="caption">
        Scrivi in italiano: i dati si filtrano da soli.
      </Say>
      <Say i={2} variant="caption">
        E l&apos;assistente AI risolve per te.
      </Say>
      <Say i={3} variant="caption">
        Anche la manutenzione è già pianificata.
      </Say>
    </ImmersiveStage>
  );
}
