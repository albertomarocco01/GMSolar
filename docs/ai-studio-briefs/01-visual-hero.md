# Brief #01 — Visual & grafiche (stock 4K + Google AI Studio "Build/app")

Niente Imagen/Veo (richiedono AI Ultra). Quindi:
- **Video & foto** → **stock 4K gratuito** (commerciale-OK).
- **Grafiche interattive** (3D, shader, generative-UI) → **sezione "Build/app" di AI Studio**
  (quella che usi tu): genera **app/prototipi** con codice → ne portiamo il meglio nei componenti Next.
- I prompt vanno in **inglese**; le note qui in italiano.

---

## 🎥 1) Video hero → STOCK 4K (no AI)

**Dove (gratis, uso commerciale — verifica la licenza del singolo file):**
Pexels Video, Pixabay, Coverr, Mixkit, Videvo.

**Cosa cercare (EN):**
- Solar: `solar panels aerial`, `solar farm drone`, `solar farm sunset aerial`, `photovoltaic aerial 4k`
- Cavo Perfetto: `ev charging cable`, `electric car charging close up`
- GMobility: `ev charging station`, `electric car charging`

**Specifiche:** 3840×2160 (o min 1080p), **16:9 orizzontale**, ≥10s, camera lenta, **senza testo/loghi/volti
riconoscibili**. Scarica `.mp4`.

**Dove metterli:** `apps/web/public/assets/` con gli stessi nomi dei placeholder, così non tocco il codice:
- `gm-solar-hero.mp4` (+ frame poster → `gm-solar-hero-poster.webp`)
- `gm-solar-drone.mp4` (secondario)
Per il poster: uno screenshot del frame migliore o `ffmpeg -i video.mp4 -vframes 1 -ss 2 poster.webp`.

## 🖼️ 2) Foto → STOCK (no AI)
Unsplash, Pexels, Pixabay. Cerca: `solar panels`, `ev charging`, `ev charging cable type 2`.
**Prodotti del catalogo Cavo Perfetto:** usa **foto reali Mennekes** (coerenza/accuratezza), non stock generico.

---

## 🧩 3) AI Studio "Build/app" — grafiche interattive (il suo punto forte)

Workflow: tab **Build** → "Describe an app" → incolla il prompt EN → genera → guarda la preview →
scarica/esporta il codice. Output = **prototipo + codice portabile** (non il sito finale): ne adattiamo
il meglio nei componenti. (La sezione app **non** esporta immagini raster: per quelle usa lo stock sopra.)

### A) GMOBILITY — scena 3D wallbox guidata dallo scroll  ← priorità
```
Build an interactive 3D hero web app using React and Three.js (react-three-fiber + drei). A sleek modern wall-mounted EV "wallbox" charger sits centered on a dark #0A0C10 stage with soft studio lighting, a faint reflective floor, forest-green (#3C9E3A) emissive accents and gentle bloom (postprocessing). On scroll, the camera slowly orbits the charger and three hotspots fade in with short labels: "Connettore Tipo 2", "Display", "Cavo". If no 3D model is provided, build the charger from simple primitives (rounded box body, a small emissive screen plane, a curved cable). Cinematic, premium, smooth 60fps, mobile responsive, and freeze to a static view when prefers-reduced-motion is set. Single self-contained app.
```

### B) Sfondo shader "energia" animato (riusabile per Solar/hub)
```
Build a full-screen animated WebGL background as a single React component using a GLSL fragment shader (three.js or a raw shader). Slowly flowing organic "energy" in warm chartreuse-green (#A8D920) and lime (#84CC16) over a near-black #0A0C10 base, soft glow, fine film grain, subtle vignette, calm and premium, seamless loop. Include a large headline placeholder in the upper-left with strong contrast. Freeze to a static gradient when prefers-reduced-motion is set. Expose accent color and speed as props.
```

### C) CAVO PERFETTO — advisor cavi con generative UI  ← priorità
```
Build an interactive "cable advisor" chat widget (React + Tailwind), dark premium UI with acid-lime (#C8D400) accents. The user types their EV (e.g. "Tesla Model 3", "Fiat 500e") and sends it; the assistant responds by RENDERING UI, not plain text: a recommended product CARD (image placeholder, title, Mode/Type badge, price, three "perché" bullet points) plus a compact comparison table of 2-3 cables. Use this hardcoded catalog: Mennekes Mode 3 Type 2 "liscio" €219; Mode 3 Type 2 "spiralato" €219 (best seller); Mode 2 Type 2 Schuko domestic €389. Smooth message and card animations. Front-end mock only (no real API): deterministic mapping from input keywords to a recommendation. Italian copy.
```

**Consegna:** quando un prototipo ti piace, mandami in chat il codice (o lo screenshot + il link AI Studio):
lo porto/adatto nel componente reale.
