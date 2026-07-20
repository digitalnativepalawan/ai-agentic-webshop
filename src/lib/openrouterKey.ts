/* Shared OpenRouter key storage.
 * Set once from the Operator Admin panel, read by the public agent widgets.
 * Stored in localStorage (client-only) — never bundled, never in the source. */

const KEY = "merqato:openrouter_key";

export function getOpenRouterKey(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setOpenRouterKey(value: string): void {
  try {
    if (value.trim()) localStorage.setItem(KEY, value.trim());
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasOpenRouterKey(): boolean {
  return getOpenRouterKey().trim().length > 0;
}
