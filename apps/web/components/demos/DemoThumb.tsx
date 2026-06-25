import Image from "next/image";
import type { Demo } from "./types";
import Motif from "./Motif";
import DemoThumbVideo from "./DemoThumbVideo";

/**
 * Anteprima della card. È DECORATIVA (`aria-hidden`): il nome accessibile della
 * card arriva dal titolo e dal link, non da qui. Tre modalità:
 *  - `media.type === "video"` → video muto che parte all'hover/focus (placeholder);
 *  - `media.type === "image"` → immagine (placeholder, swappabile);
 *  - nessun media → motivo grafico procedurale (default, zero asset di rete).
 * Colori presi dalle CSS var della card (`--card-accent/ink/soft`), impostate da
 * DemoCard, così l'anteprima porta il colore del brand.
 */
export default function DemoThumb({ demo }: { demo: Demo }) {
  return (
    <div
      aria-hidden
      className="relative aspect-video w-full overflow-hidden bg-(--card-soft)"
    >
      {/* Bagliore d'accento in alto a sinistra: dà profondità al placeholder. */}
      <div
        className="absolute inset-0 opacity-60 [background:radial-gradient(120%_90%_at_25%_15%,var(--card-accent),transparent_60%)]"
      />

      {demo.media?.type === "video" ? (
        <div className="absolute inset-0">
          <DemoThumbVideo src={demo.media.src} poster={demo.media.poster} />
        </div>
      ) : demo.media?.type === "image" ? (
        <Image
          src={demo.media.src}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-(--card-ink)">
          <Motif name={demo.motif} className="h-16 w-16 opacity-90" />
        </div>
      )}
    </div>
  );
}
