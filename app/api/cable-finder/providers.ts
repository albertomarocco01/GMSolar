/**
 * CABLE-FINDER — livello 2: layer conversazionale (AI) con FUNCTION CALLING.
 *
 * Struttura PROVIDER-AGNOSTICA: una sola interfaccia (`runProvider`) con due
 * implementazioni raw-`fetch` (Anthropic, Gemini), così non aggiungiamo SDK al
 * "fixed stack". Il provider attivo si sceglie da env (default: quello con la
 * chiave presente). La chiave vive SOLO qui, lato server (mai nel client).
 *
 * Il modello fa domande naturali, deduce la fase dal modello auto via
 * `lookupEvModel` (o chiede), poi chiama il tool deterministico `find_cable`
 * (livello 1) e consiglia lo SKU reale con prezzo. Lo streaming viene rimandato
 * al client come NDJSON dalla route.
 */
import type { Product } from "@/lib/types";
import { findCable, type ChargeLocation, type Phase, type Shape } from "@/components/shop/cable-matcher";
import { lookupEvModel } from "@/components/shop/ev-onboard";

/* ============================================================
   Tipi del protocollo verso il client (NDJSON, uno per riga)
   ============================================================ */
export type ChatMessage = { role: "user" | "assistant"; content: string };

export type FinderEvent =
  | { type: "text"; text: string }
  | { type: "products"; products: Product[] }
  | { type: "done" }
  | { type: "error"; message: string };

/* ============================================================
   System prompt + definizione del tool
   ============================================================ */
const SYSTEM_PROMPT = [
  "Sei l'assistente di «Cavo Perfetto», e-commerce italiano di cavi di ricarica Mennekes per auto elettriche.",
  "Il tuo unico compito è far trovare all'utente il CAVO giusto. Parla SEMPRE in italiano, con tono cordiale e conciso.",
  "",
  "Per consigliare un cavo DEVI chiamare lo strumento find_cable. Ti serve sapere DOVE ricarica l'utente:",
  "una colonnina/stazione pubblica, una wallbox di casa, oppure una presa domestica (Schuko).",
  "Se l'utente nomina la sua auto, passala in car_model: lo strumento deduce da solo se la ricarica è monofase o trifase.",
  "Se non riconosci il modello o l'utente non lo dà, NON inventare: chiedi semplicemente dove ricarica.",
  "Fai una domanda alla volta, breve.",
  "",
  "Quando find_cable restituisce dei match, consiglia il PRIMO (è il più adatto) citando nome e prezzo esatti,",
  "in una frase che spiega il perché. Non inventare mai prodotti, prezzi o caratteristiche: usa solo i dati del tool.",
  "Se il campo relaxed è true, dillo con onestà (es. «non ho l'abbinamento esatto, ma questo è il più vicino»).",
  "Le schede prodotto compaiono già nell'interfaccia: non ripetere lunghe tabelle, vai al consiglio.",
].join("\n");

/** Schema del tool in forma neutra (JSON Schema), riusata dai due provider. */
const FIND_CABLE = {
  name: "find_cable",
  description:
    "Cerca nel catalogo Cavo Perfetto il cavo di ricarica adatto, in base a dove ricarica l'utente " +
    "(e, se nota, all'auto e alla forma del cavo preferita).",
  parameters: {
    type: "object",
    properties: {
      car_model: {
        type: "string",
        description: "Marca e modello dell'auto se l'utente li cita (es. 'Tesla Model 3'). Serve a dedurre la fase.",
      },
      charge_location: {
        type: "string",
        enum: ["stazione", "wallbox", "presa"],
        description:
          "Dove ricarica l'utente: 'stazione' (colonnina/stazione pubblica), 'wallbox' (wallbox residenziale), 'presa' (presa domestica Schuko).",
      },
      cable_shape: {
        type: "string",
        enum: ["liscio", "spiralato"],
        description: "Forma del cavo preferita, solo se l'utente la indica.",
      },
    },
    required: ["charge_location"],
  },
} as const;

type FindCableInput = {
  car_model?: string;
  charge_location: ChargeLocation;
  cable_shape?: Shape;
};

/* ============================================================
   Esecuzione del tool (deterministica): EV-onboard → matcher
   ============================================================ */
type ToolExecution = {
  /** JSON compatto restituito al modello come tool_result. */
  forModel: Record<string, unknown>;
  /** Prodotti reali da inviare al client come schede cliccabili. */
  products: Product[];
};

function executeFindCable(rawInput: unknown): ToolExecution {
  const input = (rawInput ?? {}) as FindCableInput;
  const chargeLocation: ChargeLocation = ["stazione", "wallbox", "presa"].includes(
    input.charge_location,
  )
    ? input.charge_location
    : "stazione";

  // Deduzione della fase dal modello auto (mini-knowledge EV).
  let phase: Phase | undefined;
  let phaseSource: string | null = null;
  if (input.car_model) {
    const ev = lookupEvModel(input.car_model);
    if (ev) {
      phase = ev.acPhase;
      phaseSource = `${ev.brand} ${ev.model} (~${ev.acKw} kW ${ev.acPhase}, valore indicativo)`;
    }
  }

  const shape: Shape | undefined =
    input.cable_shape === "liscio" || input.cable_shape === "spiralato" ? input.cable_shape : undefined;

  const result = findCable({ chargeLocation, phase, shape });

  return {
    forModel: {
      use: result.use,
      deduced_phase: phase ?? null,
      phase_source: phaseSource,
      relaxed: result.relaxed,
      note: result.note ?? null,
      matches: result.matches.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        currency: p.currency,
        phase: p.specs.phase ?? null,
        shape: p.specs.shape ?? null,
        bestSeller: p.bestSeller,
      })),
    },
    products: result.matches,
  };
}

/** Numero massimo di giri agentici (call → tool → call) per sicurezza. */
const MAX_TURNS = 5;

/* ============================================================
   SSE parser condiviso (legge `data:` da uno stream fetch)
   ============================================================ */
async function* parseSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of block.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          yield JSON.parse(payload);
        } catch {
          /* chunk parziale o evento non-JSON: ignora */
        }
      }
    }
  }
}

async function safeErrorText(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.slice(0, 300);
  } catch {
    return res.statusText;
  }
}

/* ============================================================
   Provider ANTHROPIC (Messages API, x-api-key + streaming SSE)
   ============================================================ */
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

type AnthropicBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };

type AnthropicSSE = {
  type: string;
  index?: number;
  content_block?: { type: string; id?: string; name?: string };
  delta?: { type?: string; text?: string; partial_json?: string; stop_reason?: string };
};

async function* runAnthropic(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
): AsyncGenerator<FinderEvent> {
  // La cronologia conversazionale: stringhe per i turni testuali, array di
  // blocchi per i turni con tool_use/tool_result.
  const convo: Array<{ role: string; content: string | unknown[] }> = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [{ name: FIND_CABLE.name, description: FIND_CABLE.description, input_schema: FIND_CABLE.parameters }],
        tool_choice: { type: "auto" },
        messages: convo,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      yield { type: "error", message: `Anthropic ${res.status}: ${await safeErrorText(res)}` };
      return;
    }

    // Ricostruzione dei blocchi della risposta assistant, per indice.
    const blocks = new Map<number, { type: "text"; text: string } | { type: "tool_use"; id: string; name: string; json: string }>();
    let stopReason: string | null = null;

    for await (const raw of parseSSE(res.body)) {
      const ev = raw as AnthropicSSE;
      if (ev.type === "content_block_start" && ev.index !== undefined && ev.content_block) {
        const cb = ev.content_block;
        if (cb.type === "tool_use") {
          blocks.set(ev.index, { type: "tool_use", id: cb.id ?? "", name: cb.name ?? "", json: "" });
        } else {
          blocks.set(ev.index, { type: "text", text: "" });
        }
      } else if (ev.type === "content_block_delta" && ev.index !== undefined && ev.delta) {
        const b = blocks.get(ev.index);
        if (!b) continue;
        if (ev.delta.type === "text_delta" && b.type === "text" && ev.delta.text) {
          b.text += ev.delta.text;
          yield { type: "text", text: ev.delta.text };
        } else if (ev.delta.type === "input_json_delta" && b.type === "tool_use" && ev.delta.partial_json) {
          b.json += ev.delta.partial_json;
        }
      } else if (ev.type === "message_delta" && ev.delta?.stop_reason) {
        stopReason = ev.delta.stop_reason;
      }
    }

    // Blocchi in ordine d'indice → contenuto assistant da rimettere in cronologia.
    const ordered = [...blocks.entries()].sort((a, b) => a[0] - b[0]).map(([, b]) => b);
    const assistantContent: AnthropicBlock[] = ordered.map((b) =>
      b.type === "tool_use"
        ? { type: "tool_use", id: b.id, name: b.name, input: parseJsonObject(b.json) }
        : { type: "text", text: b.text },
    );

    if (stopReason !== "tool_use") {
      yield { type: "done" };
      return;
    }

    // Esegui i tool e prepara il turno successivo.
    convo.push({ role: "assistant", content: assistantContent });
    const toolResults: unknown[] = [];
    for (const b of assistantContent) {
      if (b.type === "tool_use" && b.name === "find_cable") {
        const exec = executeFindCable(b.input);
        if (exec.products.length) yield { type: "products", products: exec.products };
        toolResults.push({
          type: "tool_result",
          tool_use_id: b.id,
          content: JSON.stringify(exec.forModel),
        });
      }
    }
    convo.push({ role: "user", content: toolResults });
  }

  yield { type: "done" };
}

function parseJsonObject(json: string): Record<string, unknown> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/* ============================================================
   Provider GEMINI (generateContent streaming, key in query)
   ============================================================ */
type GeminiPart = {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
};
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };
type GeminiSSE = { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> };

async function* runGemini(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
): AsyncGenerator<FinderEvent> {
  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent` +
    `?alt=sse&key=${encodeURIComponent(apiKey)}`;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        tools: [{ functionDeclarations: [FIND_CABLE] }],
      }),
    });

    if (!res.ok || !res.body) {
      yield { type: "error", message: `Gemini ${res.status}: ${await safeErrorText(res)}` };
      return;
    }

    const calls: Array<{ name: string; args: Record<string, unknown> }> = [];

    for await (const raw of parseSSE(res.body)) {
      const ev = raw as GeminiSSE;
      const parts = ev.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part.text) {
          yield { type: "text", text: part.text };
        } else if (part.functionCall) {
          calls.push({ name: part.functionCall.name, args: part.functionCall.args ?? {} });
        }
      }
    }

    if (calls.length === 0) {
      yield { type: "done" };
      return;
    }

    // Registra la chiamata del modello e le risposte dei tool, poi rilancia.
    contents.push({ role: "model", parts: calls.map((c) => ({ functionCall: c })) });
    const responseParts: GeminiPart[] = [];
    for (const call of calls) {
      if (call.name === "find_cable") {
        const exec = executeFindCable(call.args);
        if (exec.products.length) yield { type: "products", products: exec.products };
        responseParts.push({ functionResponse: { name: call.name, response: exec.forModel } });
      }
    }
    contents.push({ role: "user", parts: responseParts });
  }

  yield { type: "done" };
}

/* ============================================================
   Selezione del provider (default: quello con la chiave)
   ============================================================ */
export type ProviderName = "anthropic" | "gemini";

export function resolveProvider(): { name: ProviderName; apiKey: string; model: string } | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  const name: ProviderName = process.env.AI_PROVIDER?.toLowerCase() === "gemini" ? "gemini" : "anthropic";
  const model =
    process.env.AI_MODEL ?? (name === "gemini" ? "gemini-2.0-flash" : "claude-opus-4-8");
  return { name, apiKey, model };
}

export function runProvider(
  name: ProviderName,
  messages: ChatMessage[],
  apiKey: string,
  model: string,
): AsyncGenerator<FinderEvent> {
  return name === "gemini" ? runGemini(messages, apiKey, model) : runAnthropic(messages, apiKey, model);
}
