/**
 * ContenutiSection — area B della Dashboard: lista blocchi/pagine con stato
 * Pubblicato/Bozza + pannello laterale di modifica con toast simulato.
 */
"use client";

import { useState } from "react";
import { CONTENT_BLOCKS } from "@/data/telemetry";
import type { ContentBlock } from "@/data/telemetry";
import ContentEditorPanel from "./ContentEditorPanel";
import ContentList from "./ContentList";

export default function ContenutiSection() {
  const [blocks, setBlocks] = useState<ContentBlock[]>(CONTENT_BLOCKS);
  const [selected, setSelected] = useState<ContentBlock | null>(null);

  function handleSave(updated: ContentBlock) {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelected(updated);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Gestione contenuti</h2>
        <p className="text-muted mt-0.5 text-sm">
          Blocchi e pagine del sito — clicca una riga per aprire l&apos;editor.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Lista blocchi */}
        <div className="min-w-0 flex-1">
          <ContentList blocks={blocks} selectedId={selected?.id ?? null} onSelect={setSelected} />
        </div>

        {/* Pannello laterale editor */}
        {selected && (
          <ContentEditorPanel
            block={selected}
            onClose={() => setSelected(null)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}
