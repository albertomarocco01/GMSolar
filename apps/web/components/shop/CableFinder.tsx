"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Section from "@gmgroup/ui/Section";
import Badge from "@gmgroup/ui/Badge";
import Card from "@gmgroup/ui/Card";
import ProductImage from "./ProductImage";
import AddToCartButton from "./cart/AddToCartButton";
import { formatPrice } from "./format";
import {
  findCable,
  LOCATION_LABELS,
  type ChargeLocation,
  type FindCableResult,
  type Phase,
  type Shape,
} from "./cable-matcher";
import { EV_MODELS, lookupEvModel } from "./ev-onboard";
import { cn } from "@gmgroup/lib/utils";
import type { Product } from "@gmgroup/lib/types";

/** Contesto del match per il "perché questo" (mirror del tipo lato server). */
type MatchContext = {
  use: string;
  phase?: Phase | null;
  /** Auto riconosciuta da cui è stata dedotta la fase, es. "Tesla Model 3". */
  car?: string | null;
  relaxed: boolean;
};

/** Eventi NDJSON dalla route (definiti qui per non importare codice server nel client). */
type FinderEvent =
  | { type: "text"; text: string }
  | { type: "products"; products: Product[]; context?: MatchContext }
  | { type: "done" }
  | { type: "error"; message: string };

type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: Product[];
  context?: MatchContext;
};

const LOCATIONS: ChargeLocation[] = ["stazione", "wallbox", "presa"];

const GREETING =
  "Ciao! Ti aiuto a trovare il cavo di ricarica perfetto per la tua auto. " +
  "Dimmi che auto hai o dove ricarichi di solito.";

let msgSeq = 0;
const nextId = () => `m${msgSeq++}`;

/* ---------------- Wizard deterministico (funziona anche senza chiave AI) ---------------- */

/** Stato accumulato dal wizard: ciò che sappiamo dell'utente finora. */
type WizardState = {
  /** Fase dedotta dal modello auto riconosciuto. */
  phase?: Phase;
  /** Etichetta dell'auto riconosciuta, es. "Tesla Model 3". */
  carLabel?: string;
  /** Dove ricarica (dedotto dal testo o scelto col pulsante). */
  location?: ChargeLocation;
  /** Forma preferita, se indicata. */
  shape?: Shape;
};

/**
 * Deduce dove ricarica l'utente da testo libero (senza AI). Controlla prima i
 * termini espliciti (wallbox, schuko…), poi gli indizi deboli ("a casa").
 */
function detectLocation(text: string): ChargeLocation | undefined {
  const s = text.toLowerCase();
  if (/wall\s?box/.test(s)) return "wallbox";
  if (/schuko|presa/.test(s)) return "presa";
  if (/colonnin|stazione|pubblic|supercharger|fast/.test(s)) return "stazione";
  if (/garage|box auto|a casa|di casa|in casa/.test(s)) return "wallbox";
  return undefined;
}

export default function CableFinder({ aiEnabled }: { aiEnabled: boolean }) {
  const headingId = useId();
  const evListId = useId();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: nextId(), role: "assistant", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  // Stato del wizard (solo quando l'AI non è attiva).
  const [wizard, setWizard] = useState<WizardState>({});
  // Cosa stiamo chiedendo all'utente nel wizard: la posizione o la forma.
  const [awaiting, setAwaiting] = useState<"location" | "shape" | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
  }
  function pushAssistant(text: string, products?: Product[], context?: MatchContext) {
    setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text, products, context }]);
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
          else if (ev.type === "products")
            patch((m) => ({ ...m, products: ev.products, context: ev.context }));
          else if (ev.type === "error")
            patch((m) => ({ ...m, text: m.text || `⚠️ ${ev.message}` }));
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

  /**
   * Cuore del wizard: dato ciò che sappiamo (auto/fase, posizione, forma),
   * decide il passo successivo — chiedere dove ricarica, chiedere la forma, o
   * dare il consiglio finale. Usa lo stesso matcher deterministico dell'AI.
   */
  function decideWizard(state: WizardState) {
    setWizard(state);

    if (!state.location) {
      setAwaiting("location");
      pushAssistant("E dove ricarichi di solito? Scegli qui sotto.");
      return;
    }

    const res = findCable({
      chargeLocation: state.location,
      phase: state.phase,
      shape: state.shape,
    });

    // Se per questo uso ci sono sia lisci sia spiralati e l'utente non ha
    // ancora scelto, chiediamo la forma prima di consigliare.
    const shapes = new Set(res.matches.map((m) => m.specs.shape).filter(Boolean));
    if (!state.shape && shapes.size > 1) {
      setAwaiting("shape");
      pushAssistant(`Per «${res.use}» ho sia cavi lisci sia spiralati. Quale preferisci?`);
      return;
    }

    setAwaiting(null);
    const context: MatchContext = {
      use: res.use,
      phase: state.phase ?? null,
      car: state.carLabel ?? null,
      relaxed: res.relaxed,
    };
    pushAssistant(recommend(res), res.matches, context);
  }

  /** Testo libero in modalità wizard: prova a riconoscere auto e posizione. */
  function wizardSubmit(text: string) {
    pushUser(text);

    const ev = lookupEvModel(text);
    const loc = detectLocation(text);
    const next: WizardState = { ...wizard };
    if (ev) {
      next.phase = ev.acPhase;
      next.carLabel = `${ev.brand} ${ev.model}`;
    }
    if (loc) next.location = loc;

    if (ev) {
      pushAssistant(
        `Ho riconosciuto la tua ${ev.brand} ${ev.model}: ricarica in ${ev.acPhase} (~${ev.acKw} kW AC, valore indicativo).`,
      );
    } else if (!loc) {
      pushAssistant(
        "Non ho trovato quel modello nella mia mini-banca dati — nessun problema, troviamo il cavo lo stesso.",
      );
    }

    decideWizard(next);
  }

  function wizardLocation(loc: ChargeLocation) {
    pushUser(LOCATION_LABELS[loc]);
    decideWizard({ ...wizard, location: loc });
  }

  function wizardShape(shape: Shape) {
    pushUser(shape === "spiralato" ? "Spiralato" : "Liscio");
    decideWizard({ ...wizard, shape });
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
    if (aiEnabled) void sendToAI(text);
    else wizardSubmit(text);
  }

  const showShapeButtons = !aiEnabled && awaiting === "shape";

  // Testo annunciato agli screen reader: l'ultima risposta dell'assistente, ma
  // solo a streaming concluso (durante lo streaming resta vuoto per non leggere
  // i token parziali).
  const liveAnnouncement = streaming
    ? ""
    : ([...messages].reverse().find((m) => m.role === "assistant")?.text ?? "");

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
                Modalità guidata (senza AI): scrivi la tua auto o usa i pulsanti — il motore di
                matching deduce mono/trifase e trova lo SKU.
              </>
            )}
          </p>
        </div>

        {/* Colonna destra: chat */}
        <Card className="flex h-[34rem] flex-col overflow-hidden">
          {/* Trascrizione visiva: NON è una live region (annuncerebbe l'intera
              conversazione ad ogni token). L'annuncio screen-reader avviene su
              un nodo dedicato all'ultimo messaggio, qui sotto. */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-5"
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

          {/* Live region dedicata: annuncia solo l'ultima risposta, a streaming
              concluso, per non leggere i token parziali uno a uno. */}
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {liveAnnouncement}
          </p>

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
              {/* Suggerimenti auto: nativi, accessibili, zero costo. */}
              <datalist id={evListId}>
                {EV_MODELS.map((ev) => (
                  <option key={`${ev.brand}-${ev.model}`} value={`${ev.brand} ${ev.model}`} />
                ))}
              </datalist>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={streaming}
                list={evListId}
                placeholder={
                  aiEnabled
                    ? "Es. «Ho una Tesla Model 3»"
                    : "Scrivi la tua auto, es. «Volkswagen ID.4»"
                }
                aria-label="Scrivi la tua auto o dove ricarichi"
                className="border-border bg-background focus-visible:border-accent h-11 flex-1 rounded-full border px-4 text-sm outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
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
          {msg.context && <MatchWhy context={msg.context} />}
          {msg.products.slice(0, 2).map((p) => (
            <ChatProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/** "Perché questo": rende tangibile cosa ha guidato il consiglio del tool. */
function MatchWhy({ context }: { context: MatchContext }) {
  const chips: string[] = [`Per ${context.use}`];
  if (context.phase) {
    chips.push(context.car ? `${context.phase} · ${context.car}` : context.phase);
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted text-[0.65rem] font-semibold tracking-widest uppercase">
        Perché
      </span>
      {chips.map((c) => (
        <span
          key={c}
          className="bg-accent-soft text-accent-ink rounded-full px-2.5 py-0.5 text-xs font-medium"
        >
          {c}
        </span>
      ))}
      {context.relaxed && (
        <span className="bg-surface-2 text-muted rounded-full px-2.5 py-0.5 text-xs">
          alternativa più vicina
        </span>
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
