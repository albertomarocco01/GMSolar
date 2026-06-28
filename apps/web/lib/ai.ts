/**
 * Helper AI multi-provider — completamento SINGLE-SHOT (non streaming).
 *
 * Le demo "lead qualifier" e "analytics" hanno bisogno di una risposta JSON in
 * un colpo solo (non del function-calling in streaming del cable-finder). Questo
 * modulo generalizza lo stesso pattern raw-`fetch` provider-agnostico del
 * cable-finder (Anthropic / Gemini / DeepSeek), riusandone il CONTRATTO ENV:
 *   - AI_API_KEY   → se assente, niente AI (le route degradano al fallback
 *                    deterministico: la demo non si rompe mai)
 *   - AI_PROVIDER  → "anthropic" (default) | "gemini" | "deepseek"
 *   - AI_MODEL     → override del modello di default per provider
 *
 * La chiave vive SOLO qui, lato server: questo file è importato esclusivamente
 * dai route handler. Nessun segreto attraversa il confine col client.
 */
export type AiProvider = "anthropic" | "gemini" | "deepseek";

export type ResolvedProvider = { name: AiProvider; apiKey: string; model: string };

/**
 * DEMO — AI reale DISATTIVATA: ritorna SEMPRE `null`.
 * Ogni route usa così il proprio fallback deterministico locale (risposte finte
 * ma plausibili): nessun provider esterno viene mai contattato, neanche se
 * `AI_API_KEY` è presente nell'ambiente. Per riattivare l'AI vera in produzione,
 * ripristinare la risoluzione del provider da env (vedi storico git).
 */
export function resolveAiProvider(): ResolvedProvider | null {
  return null;
}

export type AiMessage = { role: "user" | "assistant"; content: string };

export type CompleteOptions = {
  /** Istruzione di sistema (persona + regole). */
  system: string;
  /** Cronologia + ultimo messaggio utente (il primo turno dev'essere "user"). */
  messages: AiMessage[];
  /** Chiede al provider una risposta in JSON puro, dove supportato. */
  json?: boolean;
  maxTokens?: number;
};

async function safeErr(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300);
  } catch {
    return res.statusText;
  }
}

/* ---------------- Anthropic (Messages API, non streaming) ---------------- */
async function completeAnthropic(p: ResolvedProvider, o: CompleteOptions): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": p.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: p.model,
      max_tokens: o.maxTokens ?? 1024,
      system: o.system,
      messages: o.messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await safeErr(res)}`);
  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  return (data.content ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");
}

/* ---------------- Gemini (generateContent, non streaming) ---------------- */
async function completeGemini(p: ResolvedProvider, o: CompleteOptions): Promise<string> {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(p.model)}:generateContent` +
    `?key=${encodeURIComponent(p.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: o.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: o.json ? { responseMimeType: "application/json" } : undefined,
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await safeErr(res)}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return (data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? "").join("");
}

/* ------------- DeepSeek (OpenAI-compatibile, non streaming) -------------- */
async function completeDeepSeek(p: ResolvedProvider, o: CompleteOptions): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${p.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: p.model,
      max_tokens: o.maxTokens ?? 1024,
      messages: [{ role: "system", content: o.system }, ...o.messages],
      response_format: o.json ? { type: "json_object" } : undefined,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await safeErr(res)}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Completamento single-shot col provider attivo. Ritorna il testo grezzo. */
export async function complete(p: ResolvedProvider, o: CompleteOptions): Promise<string> {
  switch (p.name) {
    case "gemini":
      return completeGemini(p, o);
    case "deepseek":
      return completeDeepSeek(p, o);
    default:
      return completeAnthropic(p, o);
  }
}

/**
 * Completamento che si aspetta JSON: estrae il primo oggetto `{...}` dal testo
 * (i modelli a volte avvolgono il JSON in prosa o in un blocco ```json). Ritorna
 * l'oggetto parsato, oppure `null` se non è JSON valido (così il chiamante può
 * ripiegare sul percorso deterministico).
 */
export async function completeJSON<T = unknown>(
  p: ResolvedProvider,
  o: CompleteOptions,
): Promise<T | null> {
  const raw = await complete(p, { ...o, json: true });
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
