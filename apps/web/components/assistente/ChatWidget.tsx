"use client";

/**
 * ChatWidget — presentazione del widget chat (senza logica di rete).
 *
 * Riceve messaggi e stato dal genitore (SiteAssistant) ed espone callback per
 * input/invio. Gestisce solo dettagli di presentazione: auto-scroll in fondo e
 * prompt di avvio. a11y: il log dei messaggi ha role="log" + aria-live; l'input
 * è etichettato.
 */
import { useEffect, useRef } from "react";
import { Bot, Send } from "lucide-react";
import { cn } from "@gmgroup/lib/utils";
import MessageBubble from "./MessageBubble";
import type { ChatMessage } from "./types";

export interface ChatWidgetProps {
  messages: ChatMessage[];
  input: string;
  isTyping: boolean;
  /** Prompt di esempio mostrati finché la conversazione è all'inizio. */
  starters?: string[];
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onStarterClick: (text: string) => void;
  className?: string;
}

export default function ChatWidget({
  messages,
  input,
  isTyping,
  starters = [],
  onInputChange,
  onSubmit,
  onStarterClick,
  className,
}: ChatWidgetProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll in fondo a ogni nuovo messaggio / cambio di stato.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const showStarters = starters.length > 0 && messages.length <= 1 && !isTyping;

  return (
    <div
      className={cn(
        "bg-background border-border shadow-card flex h-[34rem] flex-col overflow-hidden rounded-xl border",
        className,
      )}
    >
      {/* Header */}
      <div className="border-border bg-surface flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-accent-soft text-accent-ink flex h-8 w-8 items-center justify-center rounded-full">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">Assistente del sito</p>
          <p className="text-muted text-xs">Demo — risponde e ti indirizza</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 text-xs">
          <span className="bg-accent h-2 w-2 rounded-full" aria-hidden="true" />
          <span className="text-muted">online</span>
        </span>
      </div>

      {/* Log messaggi */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversazione con l'assistente"
        className="bg-surface-2/40 flex flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2" aria-label="L'assistente sta scrivendo">
            <span className="bg-accent-soft text-accent-ink flex h-7 w-7 items-center justify-center rounded-full">
              <Bot className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="bg-surface border-border flex items-center gap-1 rounded-2xl rounded-tl-sm border px-3.5 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="bg-muted h-1.5 w-1.5 animate-bounce rounded-full"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
              <span className="sr-only">sta scrivendo…</span>
            </div>
          </div>
        )}

        {showStarters && (
          <div className="mt-1 flex flex-col gap-2">
            <p className="text-muted text-xs font-medium">Prova a chiedere:</p>
            <div className="flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStarterClick(s)}
                  className="border-border text-foreground hover:border-accent hover:bg-accent-soft focus-visible:ring-accent-ring rounded-full border px-3 py-1.5 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        className="border-border bg-surface flex items-center gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label htmlFor="site-assistant-input" className="sr-only">
          Scrivi un messaggio all'assistente
        </label>
        <input
          id="site-assistant-input"
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Scrivi la tua domanda…"
          autoComplete="off"
          disabled={isTyping}
          className="bg-background text-foreground border-border focus-visible:border-accent focus-visible:ring-accent-ring placeholder:text-muted h-10 flex-1 rounded-full border px-4 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isTyping || input.trim().length === 0}
          aria-label="Invia messaggio"
          className="bg-accent text-accent-contrast hover:bg-accent-strong focus-visible:ring-accent-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
