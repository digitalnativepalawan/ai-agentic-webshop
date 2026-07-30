/* Shared agent generation for the public widgets.
 * Reads the admin-configured AgentConfig: OpenRouter (remote) or local Ollama.
 * Streams tokens to onToken. Throws on failure. */

import { getAgentConfig } from "./agentConfig";

export interface StreamOpts {
  system: string;
  user: string;
  maxTokens?: number;
  onToken: (text: string) => void;
  model?: string; // Optional override for the default model from config
}

async function readSSE(
  res: Response,
  onToken: (t: string) => void,
): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response stream");
  const decoder = new TextDecoder();
  let buf = "";
  let out = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const chunk of parts) {
      const line = chunk.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const tok = json.choices?.[0]?.delta?.content ?? json.message?.content ?? "";
        if (tok) {
          out += tok;
          onToken(out);
        }
      } catch {
        /* ignore keepalive / partial */
      }
    }
  }
  return out;
}

export async function generate({ system, user, maxTokens = 800, onToken, model }: StreamOpts): Promise<string> {
  const cfg = getAgentConfig();
  if (cfg.mode === "openrouter" && cfg.openrouterKey.trim()) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.openrouterKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://merqato.digital",
        "X-Title": "Merqato Agent",
      },
      body: JSON.stringify({
        model: model || cfg.model || "google/gemini-2.0-flash-exp:free",
        stream: true,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${t.slice(0, 160)}`);
    }
    return readSSE(res, onToken);
  }

  if (cfg.mode === "ollama" && cfg.model.trim()) {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || cfg.model.trim(),
        stream: true,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Ollama ${res.status}: ${t.slice(0, 160)}`);
    }
    return readSSE(res, onToken);
  }

  throw new Error("No model connected in Operator Admin.");
}
