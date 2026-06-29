/**
 * ContentEditorPanel — pannello laterale di modifica per un blocco/pagina.
 * Simula il salvataggio in stato locale + toast di conferma (nessun backend).
 */
"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import Button from "@gmgroup/ui/Button";
import type { ContentBlock } from "@/data/telemetry";

type Props = {
  block: ContentBlock;
  onClose: () => void;
  onSave: (updated: ContentBlock) => void;
};

export default function ContentEditorPanel({ block, onClose, onSave }: Props) {
  const [titolo, setTitolo] = useState(block.titolo);
  const [contenuto, setContenuto] = useState(block.contenuto);
  const [stato, setStato] = useState<ContentBlock["stato"]>(block.stato);
  const [toastVisible, setToastVisible] = useState(false);

  // Quando cambia il blocco selezionato, ri-sincronizza i campi DURANTE il render
  // (pattern React "adjusting state when a prop changes": niente effect, niente
  // cascading render → vedi react.dev/learn/you-might-not-need-an-effect). Si
  // sincronizza sull'id: dopo un salvataggio l'id resta lo stesso, quindi il toast
  // di conferma non viene azzerato.
  const [syncedId, setSyncedId] = useState(block.id);
  if (syncedId !== block.id) {
    setSyncedId(block.id);
    setTitolo(block.titolo);
    setContenuto(block.contenuto);
    setStato(block.stato);
    setToastVisible(false);
  }

  function handleSave() {
    const updated: ContentBlock = {
      ...block,
      titolo,
      contenuto,
      stato,
      ultimaModifica: new Date().toISOString().slice(0, 10),
    };
    onSave(updated);
    setToastVisible(true);
    const t = setTimeout(() => setToastVisible(false), 3000);
    return () => clearTimeout(t);
  }

  return (
    <aside
      className="border-border bg-surface flex w-full flex-col border-l lg:w-80 xl:w-96"
      aria-label="Pannello di modifica contenuto"
    >
      {/* Intestazione */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div>
          <p className="text-muted text-xs font-medium">{block.site.toUpperCase()}</p>
          <h2 className="text-foreground mt-0.5 text-sm font-semibold">{block.nome}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:bg-surface-2 hover:text-foreground rounded p-1.5"
          aria-label="Chiudi pannello"
        >
          <X size={16} />
        </button>
      </div>

      {/* Campi di modifica */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div>
          <label htmlFor="editor-titolo" className="text-muted mb-1.5 block text-xs font-medium">
            Titolo
          </label>
          <input
            id="editor-titolo"
            type="text"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted focus:border-accent focus:ring-accent/40 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            placeholder="Titolo del blocco"
          />
        </div>

        <div>
          <label htmlFor="editor-contenuto" className="text-muted mb-1.5 block text-xs font-medium">
            Contenuto
          </label>
          <textarea
            id="editor-contenuto"
            value={contenuto}
            onChange={(e) => setContenuto(e.target.value)}
            rows={8}
            className="border-border bg-background text-foreground placeholder:text-muted focus:border-accent focus:ring-accent/40 w-full resize-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            placeholder="Testo del blocco..."
          />
        </div>

        {/* Toggle pubblicazione (WAI-ARIA switch) */}
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={stato === "pubblicato"}
            onClick={() => setStato((s) => (s === "pubblicato" ? "bozza" : "pubblicato"))}
            className={`focus:ring-accent relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none ${stato === "pubblicato" ? "bg-accent" : "bg-surface-2 border-border"}`}
            aria-label="Stato pubblicazione"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${stato === "pubblicato" ? "translate-x-4" : "translate-x-0"}`}
            />
          </button>
          <span className="text-foreground text-sm">
            {stato === "pubblicato" ? "Pubblicato" : "Bozza"}
          </span>
        </div>
      </div>

      {/* Azioni */}
      <div className="border-border space-y-3 border-t p-4">
        <Button onClick={handleSave} size="sm" className="w-full gap-2">
          <Save size={14} aria-hidden />
          Salva modifiche
        </Button>

        {/* Toast locale simulato */}
        {toastVisible && (
          <div
            role="status"
            aria-live="polite"
            className="animate-fade-in bg-accent-soft text-accent-ink flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
          >
            <span aria-hidden>✓</span>
            <span>Salvato (simulazione locale — nessun backend)</span>
          </div>
        )}
      </div>
    </aside>
  );
}
