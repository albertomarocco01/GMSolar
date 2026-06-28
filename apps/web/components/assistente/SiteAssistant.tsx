"use client";

/**
 * SiteAssistant — assistente di sito AUTOSUFFICIENTE.
 *
 * Possiede lo stato della conversazione e parla da solo con `/api/assistant`
 * (single-shot, niente streaming). È pensato per essere montato ovunque — nella
 * pagina /assistente come demo o, in futuro, come widget globale nel layout —
 * senza props obbligatorie. Eredita automaticamente il tema/accent della route.
 */
import { useCallback, useState } from "react";
import ChatWidget from "./ChatWidget";
import type { AssistantResponse, ChatMessage, Suggestion } from "./types";

// Id incrementale puro (niente Math.random nel render → nessun mismatch di hydration).
let msgSeq = 0;
const nextId = () => `assist-${++msgSeq}`;

/** Prompt di avvio mostrati all'inizio. */
const STARTERS = [
  "Quali servizi offrite?",
  "Come funziona l'assistente AI?",
  "Quanto costa un sito vetrina?",
  "Avete un'app per la ricarica EV?",
];

const WELCOME: ChatMessage = {
  id: "assist-welcome",
  role: "assistant",
  content:
    "Ciao! Sono l'assistente del sito. Posso spiegarti i nostri servizi e indirizzarti alla sezione giusta. Cosa ti serve?",
};

/** Guard minimale sulla risposta della route (input non fidato lato client). */
function parseResponse(value: unknown): AssistantResponse {
  if (!value || typeof value !== "object") return { answer: "", suggestions: [] };
  const o = value as Record<string, unknown>;
  const answer = typeof o.answer === "string" ? o.answer : "";
  const suggestions = Array.isArray(o.suggestions)
    ? o.suggestions.filter(
        (s): s is Suggestion =>
          !!s &&
          typeof s === "object" &&
          typeof (s as Suggestion).label === "string" &&
          typeof (s as Suggestion).href === "string",
      )
    : [];
  return { answer, suggestions };
}

export interface SiteAssistantProps {
  /** Classi extra sul contenitore del widget (es. posizionamento). */
  className?: string;
}

export default function SiteAssistant({ className }: SiteAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMessage: ChatMessage = { id: nextId(), role: "user", content: trimmed };
      const history = [...messages, userMessage];
      setMessages(history);
      setInput("");
      setIsTyping(true);

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = parseResponse(await res.json());
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content:
              data.answer ||
              "Mi spiace, non ho una risposta al momento. Dai un'occhiata alla panoramica dei servizi.",
            suggestions: data.suggestions,
          },
        ]);
      } catch {
        // La demo non si rompe mai: messaggio di cortesia + scorciatoia.
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content:
              "Si è verificato un problema di connessione. Riprova tra poco oppure esplora i servizi dalla pagina principale.",
            suggestions: [{ label: "Panoramica dei servizi", href: "/" }],
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping],
  );

  return (
    <ChatWidget
      className={className}
      messages={messages}
      input={input}
      isTyping={isTyping}
      starters={STARTERS}
      onInputChange={setInput}
      onSubmit={() => send(input)}
      onStarterClick={send}
    />
  );
}
