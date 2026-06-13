/**
 * CABLE-FINDER — route handler server-side.
 *
 * GET  → stato dell'AI (per far decidere alla UI: chat AI o wizard a bottoni).
 * POST → conversazione in streaming (NDJSON) con function calling.
 *
 * La chiave provider sta SOLO qui (env AI_API_KEY), mai nel client. Se manca,
 * POST risponde 503 e la UI degrada al wizard deterministico — la demo non si
 * rompe mai.
 */
import { resolveProvider, runProvider, type ChatMessage, type FinderEvent } from "./providers";

// Niente cache: è una risposta conversazionale in streaming.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const provider = resolveProvider();
  return Response.json({
    aiEnabled: provider !== null,
    provider: provider?.name ?? null,
  });
}

/** Tiene solo i campi attesi e scarta input malformati. */
function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const out: ChatMessage[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const m = item as { role?: unknown; content?: unknown };
    const role = m.role === "assistant" ? "assistant" : m.role === "user" ? "user" : null;
    if (!role || typeof m.content !== "string" || !m.content.trim()) continue;
    out.push({ role, content: m.content.slice(0, 2000) });
  }
  // L'API richiede che il primo turno sia dell'utente.
  while (out.length && out[0].role !== "user") out.shift();
  return out.slice(-20);
}

export async function POST(req: Request) {
  const provider = resolveProvider();
  if (!provider) {
    return Response.json(
      { type: "error", message: "Assistente AI non configurato (manca AI_API_KEY)." },
      { status: 503 },
    );
  }

  let messages: ChatMessage[] = [];
  try {
    const body = await req.json();
    messages = sanitizeMessages((body as { messages?: unknown }).messages);
  } catch {
    return Response.json({ type: "error", message: "Richiesta non valida." }, { status: 400 });
  }
  if (messages.length === 0) {
    return Response.json({ type: "error", message: "Nessun messaggio da elaborare." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const write = (controller: ReadableStreamDefaultController, ev: FinderEvent) =>
    controller.enqueue(encoder.encode(JSON.stringify(ev) + "\n"));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const ev of runProvider(provider.name, messages, provider.apiKey, provider.model)) {
          write(controller, ev);
        }
      } catch (err) {
        write(controller, {
          type: "error",
          message: err instanceof Error ? err.message : "Errore imprevisto dell'assistente.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
