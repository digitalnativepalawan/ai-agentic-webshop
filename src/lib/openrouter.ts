/* Shared OpenRouter streaming caller for the public agent widgets.
 * The key is supplied by the caller (read from admin-configured localStorage). */

export interface StreamOpts {
  model?: string;
  maxTokens?: number;
  onToken: (text: string) => void;
}

export async function streamOpenRouter(
  system: string,
  user: string,
  key: string,
  { model = "google/gemini-2.0-flash-exp:free", maxTokens = 900, onToken }: StreamOpts,
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://merqato.digital",
      "X-Title": "Merqato Agent",
    },
    body: JSON.stringify({
      model,
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
        const tok = json.choices?.[0]?.delta?.content;
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
