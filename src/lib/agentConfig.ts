/* Shared agent-model config, set once from the Operator Admin panel and read by the
 * public agent widgets. Stored in localStorage (client-only) — never bundled, never in source.
 *
 * Config shape:
 *   mode:  "openrouter" | "ollama" | null   (null = nothing configured, no default)
 *   openrouterKey: string
 *   model: string   (openrouter model id, or ollama model name)
 */

const CFG = "merqato:agent_config";

export type AgentMode = "openrouter" | "ollama";

export interface AgentConfig {
  mode: AgentMode | null;
  openrouterKey: string;
  model: string;
}

const EMPTY: AgentConfig = { mode: null, openrouterKey: "", model: "" };

export function getAgentConfig(): AgentConfig {
  try {
    const raw = localStorage.getItem(CFG);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<AgentConfig>;
    return {
      mode: parsed.mode ?? null,
      openrouterKey: parsed.openrouterKey ?? "",
      model: parsed.model ?? "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function setAgentConfig(cfg: AgentConfig): void {
  try {
    localStorage.setItem(CFG, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
}

export function clearAgentConfig(): void {
  try {
    localStorage.removeItem(CFG);
  } catch {
    /* ignore */
  }
}

export function hasConfig(): boolean {
  const c = getAgentConfig();
  if (c.mode === "openrouter") return c.openrouterKey.trim().length > 0;
  if (c.mode === "ollama") return c.model.trim().length > 0;
  return false;
}

/** Validate OpenRouter key by hitting the public models endpoint. */
export async function checkOpenRouter(key: string): Promise<{ ok: boolean; models: string[] }> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${key.trim()}` },
  });
  if (!res.ok) return { ok: false, models: [] };
  const data = await res.json();
  const models: string[] = Array.isArray(data?.data)
    ? data.data.map((m: { id: string }) => m.id).sort()
    : [];
  return { ok: models.length > 0, models };
}

/** List models from the local Ollama device. */
export async function listOllamaModels(): Promise<{ ok: boolean; models: string[] }> {
  try {
    const res = await fetch("http://localhost:11434/api/tags");
    if (!res.ok) return { ok: false, models: [] };
    const data = await res.json();
    const models: string[] = Array.isArray(data?.models)
      ? data.models.map((m: { name: string }) => m.name).sort()
      : [];
    return { ok: models.length > 0, models };
  } catch {
    return { ok: false, models: [] };
  }
}
