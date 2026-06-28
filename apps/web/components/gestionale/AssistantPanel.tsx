"use client";

/**
 * AssistantPanel — assistente AI integrato. L'utente chiede in linguaggio
 * naturale; il pannello chiama `POST /api/gestionale`, mostra la risposta e
 * propaga il risultato (entità + filtro) al parent via `onResult`, che applica
 * il filtro alle tabelle. Con chiave AI usa l'LLM; senza chiave la route
 * risponde con il fallback euristico (badge "euristica"). Input ostile: il
 * server fa guardrail e sanitizzazione.
 */
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, X, ShieldAlert, Cpu, Wand2 } from "lucide-react";
import type { AssistantResult, AssistantSource } from "./types";

export interface AssistantPanelProps {
  onResult: (result: AssistantResult) => void;
  onClose: () => void;
}

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  source?: AssistantSource;
  matchedCount?: number;
}

let seq = 0;
const nextId = () => `msg-${++seq}`;

const SUGGESTIONS = [
  "ordini aperti sopra 50.000 €",
  "clienti del Piemonte",
  "progetti in ritardo",
  "scadenze a Milano",
];

const SOURCE_BADGE: Record<AssistantSource, { label: string; className: string }> = {
  ai: { label: "AI", className: "bg-accent-soft text-accent-ink" },
  fallback: { label: "euristica", className: "bg-surface-2 text-muted" },
  guardrail: { label: "bloccato", className: "bg-rose-500/12 text-rose-700 dark:text-rose-300" },
};

export default function AssistantPanel({ onResult, onClose }: AssistantPanelProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/gestionale")
      .then((r) => r.json())
      .then((d: { aiEnabled?: boolean }) => alive && setAiEnabled(Boolean(d.aiEnabled)))
      .catch(() => alive && setAiEnabled(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ask = async (query: string) => {
    const q = query.trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: q }]);
    try {
      const res = await fetch("/api/gestionale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error("bad status");
      const result = (await res.json()) as AssistantResult;
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: result.reply,
          source: result.source,
          matchedCount: result.matchedCount,
        },
      ]);
      onResult(result);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          text: "Errore di comunicazione. Riprova.",
          source: "guardrail",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="border-border bg-surface flex h-full w-full flex-col border-t lg:w-80 lg:border-t-0 lg:border-l">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <span className="bg-accent text-accent-contrast rounded-lg p-1.5">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-foreground text-sm font-semibold">Assistente AI</div>
            <div className="text-muted flex items-center gap-1 text-xs">
              {aiEnabled == null ? (
                "…"
              ) : aiEnabled ? (
                <>
                  <Cpu className="h-3 w-3" /> modello attivo
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3" /> modalità demo
                </>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi assistente"
          className="text-muted hover:bg-surface-2 hover:text-foreground rounded-lg p-1.5 transition-colors lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messaggi */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-muted space-y-3 text-sm">
            <p>Chiedi qualcosa sui tuoi dati. Per esempio:</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="border-border bg-background hover:border-accent hover:text-accent-ink rounded-lg border px-3 py-2 text-left text-sm transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <p className="bg-accent text-accent-contrast max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-sm">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={m.id} className="flex flex-col items-start gap-1">
              <p className="bg-surface-2 text-foreground max-w-[90%] rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
                {m.source === "guardrail" && (
                  <ShieldAlert className="-mt-0.5 mr-1 inline h-4 w-4 text-rose-500" aria-hidden />
                )}
                {m.text}
              </p>
              {m.source && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SOURCE_BADGE[m.source].className}`}
                >
                  {SOURCE_BADGE[m.source].label}
                </span>
              )}
            </div>
          ),
        )}

        {loading && <p className="text-muted text-xs">Sto analizzando i dati…</p>}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="border-border flex items-center gap-2 border-t p-3"
      >
        <label htmlFor="assistant-input" className="sr-only">
          Domanda per l&apos;assistente
        </label>
        <input
          id="assistant-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Scrivi una richiesta…"
          className="border-border bg-background focus:border-accent focus:ring-accent-ring flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Invia"
          className="bg-accent text-accent-contrast hover:bg-accent-strong flex shrink-0 items-center justify-center rounded-lg p-2 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </aside>
  );
}
