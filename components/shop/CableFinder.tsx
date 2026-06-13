"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Section from "@/components/ui/Section";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ProductImage from "./ProductImage";
import AddToCartButton from "./cart/AddToCartButton";
import { formatPrice } from "./format";
import {
  findCable,
  LOCATION_LABELS,
  type ChargeLocation,
  type FindCableResult,
} from "./cable-matcher";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

/** Eventi NDJSON dalla route (definiti qui per non importare codice server nel client). */
type FinderEvent =
  | { type: "text"; text: string }
  | { type: "products"; products: Product[] }
  | { type: "done" }
  | { type: "error"; message: string };

type ChatMsg = { id: string; role: "user" | "assistant"; text: string; products?: Product[] };

const LOCATIONS: ChargeLocation[] = ["stazione", "wallbox", "presa"];

const GREETING =
  "Ciao! Ti aiuto a trovare il cavo di ricarica perfetto per la tua auto. " +
  "Dimmi che auto hai o dove ricarichi di solito.";

let msgSeq = 0;
const nextId = () => `m${msgSeq++}`;

export default function CableFinder({ aiEnabled }: { aiEnabled: boolean }) {
  const headingId = useId();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: nextId(), role: "assistant", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  // Stato del wizard (solo quando l'AI non è attiva).
  const [pendingAsk, setPendingAsk] = useState<"shape" | null>(null);
  const pendingLocation = useRef<ChargeLocation | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
  }
  function pushAssistant(text: string, products?: Product[]) {
    setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text, products }]);
  }

  /* ---------------- Percorso AI (chiave presente) ---------------- */
  async function sendToAI(text: string) {
    const userMsg: ChatMsg = { id: nextId(), role: "user", text };
    const assistantId = nextId();
    const history = [...messages, userMsg]
      .filter((m) => m.text)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", text: "" }]);
    setStreaming(true);

    const patch = (fn: (m: ChatMsg) => ChatMsg) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)));

    try {
      const res = await fetch("/api/cable-finder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        patch((m) => ({ ...m, text: "Assistente non disponibile in questo momento." }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          let ev: FinderEvent;
          try {
            ev = JSON.parse(line) as FinderEvent;
          } catch {
            continue;
          }
          if (ev.type === "text") patch((m) => ({ ...m, text: m.text + ev.text }));
          else if (ev.type === "products") patch((m) => ({ ...m, products: ev.products }));
          else if (ev.type === "error") patch((m) => ({ ...m, text: m.text || `⚠️ ${ev.message}` }));
        }
      }
    } catch {
      patch((m) => ({ ...m, text: m.text || "Errore di connessione con l'assistente." }));
    } finally {
      setStreaming(false);
    }
  }

  /* ---------------- Percorso wizard (nessuna chiave) ---------------- */
  function recommend(res: FindCableResult): string {
    if (res.matches.length === 0) {
      return "Non ho trovato un cavo adatto a catalogo: dai un'occhiata alle altre categorie qui sotto.";
    }
    const top = res.matches[0];
    const lead = res.relaxed && res.note ? `${res.note} ` : "";
    return `${lead}Ti consiglio «${top.name}» a ${formatPrice(top.price)}.`;
  }

  function wizardLocation(loc: ChargeLocation) {
    pushUser(LOCATION_LABELS[loc]);
    const res = findCable({ chargeLocation: loc });
    const shapes = new Set(res.matches.map((m) => m.specs.shape).filter(Boolean));
    if (shapes.size > 1) {
      pendingLocation.current = loc;
      setPendingAsk("shape");
      pushAssistant(
        `Per la ricarica «${res.use}» abbiamo sia cavi lisci sia spiralati. Quale preferisci?`,
      );
    } else {
      setPendingAsk(null);
      pushAssistant(recommend(res), res.matches);
    }
  }

  function wizardShape(shape: "liscio" | "spiralato") {
    const loc = pendingLocation.current;
    if (!loc) return;
    pushUser(shape === "spiralato" ? "Spiralato" : "Liscio");
    const res = findCable({ chargeLocation: loc, shape });
    setPendingAsk(null);
    pushAssistant(recommend(res), res.matches);
  }

  /* ---------------- Invio ---------------- */
  function onLocationButton(loc: ChargeLocation) {
    if (streaming) return;
    if (aiEnabled) {
      void sendToAI(`Ricarico soprattutto a una ${LOCATION_LABELS[loc].toLowerCase()}.`);
    } else {
      wizardLocation(loc);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    void sendToAI(text);
  }

  const showShapeButtons = !aiEnabled && pendingAsk === "shape";

  return (
    <Section id="cable-finder" className="bg-surface border-border border-y">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Colonna sinistra: pitch */}
        <div className="lg:sticky lg:top-24">
          <Badge>Assistente AI</Badge>
          <h2 className="font-display text-display-sm mt-4 font-bold tracking-tight text-balance">
            Trova il cavo perfetto per la tua auto
          </h2>
          <p className="text-muted mt-4 text-lg leading-relaxed">
            Dicci che auto hai o dove ricarichi: l&apos;assistente capisce se ti serve mono o
            trifase e ti consiglia lo SKU giusto dal catalogo.
          </p>
          <p className="text-muted mt-4 text-sm">
            {aiEnabled ? (
              <>
                <span className="text-accent-ink font-medium">● </span>
                Assistente conversazionale attivo.
              </>
            ) : (
              <>
                <span className="font-medium">● </span>
                Modalità guidata: rispondi ai pulsanti qui accanto — il motore di matching gira
                comunque, senza AI.
              </>
            )}
          </p>
        </div>

        {/* Colonna destra: chat */}
        <Card className="flex h-[34rem] flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-5"
            aria-live="polite"
            aria-labelledby={headingId}
          >
            <h3 id={headingId} className="sr-only">
              Conversazione con l&apos;assistente Cavo Perfetto
            </h3>
            {messages.map((m) => (
              <ChatBubble key={m.id} msg={m} />
            ))}
            {streaming && <TypingDots />}
          </div>

          {/* Azioni rapide + input */}
          <div className="border-border space-y-3 border-t p-4">
            <div className="flex flex-wrap gap-2">
              {showShapeButtons ? (
                <>
                  <QuickButton onClick={() => wizardShape("liscio")}>Liscio</QuickButton>
                  <QuickButton onClick={() => wizardShape("spiralato")}>Spiralato</QuickButton>
                </>
              ) : (
                LOCATIONS.map((loc) => (
                  <QuickButton key={loc} disabled={streaming} onClick={() => onLocationButton(loc)}>
                    {LOCATION_LABELS[loc]}
                  </QuickButton>
                ))
              )}
            </div>

            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!aiEnabled || streaming}
                placeholder={
                  aiEnabled
                    ? "Es. «Ho una Tesla Model 3»"
                    : "Scrivi disponibile con l'assistente AI attivo"
                }
                aria-label="Scrivi un messaggio all'assistente"
                className="border-border bg-background focus-visible:border-accent h-11 flex-1 rounded-full border px-4 text-sm outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!aiEnabled || streaming || !input.trim()}
                aria-label="Invia"
                className="bg-accent text-accent-contrast hover:bg-accent-strong flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 12l16-8-6 16-2.5-6.5L4 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </Card>
      </div>
    </Section>
  );
}

/* ---------------- Sotto-componenti ---------------- */
function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      {msg.text && (
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-accent text-accent-contrast rounded-br-sm"
              : "bg-surface-2 text-foreground rounded-bl-sm",
          )}
        >
          {msg.text}
        </div>
      )}
      {msg.products && msg.products.length > 0 && (
        <div className="grid w-full max-w-[85%] gap-2">
          {msg.products.slice(0, 2).map((p) => (
            <ChatProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChatProductCard({ product }: { product: Product }) {
  return (
    <Card interactive className="flex items-center gap-3 overflow-hidden p-2">
      <Link href={`/shop/${product.id}`} className="shrink-0" aria-label={product.name}>
        <ProductImage product={product} className="h-16 w-20 rounded-md" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/shop/${product.id}`}>
          <p className="truncate text-sm font-medium">{product.name}</p>
        </Link>
        <p className="text-muted text-sm">{formatPrice(product.price)}</p>
      </div>
      <AddToCartButton product={product} size="sm" variant="outline" label="Aggiungi" />
    </Card>
  );
}

function QuickButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="border-accent/40 text-accent-ink hover:bg-accent-soft rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-muted h-2 w-2 animate-bounce rounded-full"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
