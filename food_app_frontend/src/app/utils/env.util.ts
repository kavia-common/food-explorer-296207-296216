type MaybeString = string | undefined | null;

/**
 * PUBLIC_INTERFACE
 * Returns environment variable value by key, with optional default.
 */
export function getEnv(key: string, defaultValue?: string): string {
  // Angular CLI does not expose process.env at runtime in browser; use injected replacements if available.
  // Try window env shim if set by hosting platform.
  const win = globalThis as any;
  const viaWindow = win?.__ENV__?.[key] as MaybeString;
  if (viaWindow) return viaWindow;

  // Try import.meta.env (Vite-like) if provided by environment.
  const viaImportMeta = (import.meta as any)?.env?.[key] as MaybeString;
  if (viaImportMeta) return viaImportMeta as string;

  // Try Node process.env during SSR
  const viaProcess = (typeof process !== 'undefined' ? (process.env as any)?.[key] : undefined) as MaybeString;
  if (viaProcess) return viaProcess as string;

  return defaultValue ?? '';
}

/**
 * PUBLIC_INTERFACE
 * Get API base URL from NG_APP_API_BASE or NG_APP_BACKEND_URL, else empty string.
 */
export function getApiBase(): string {
  return (
    getEnv('NG_APP_API_BASE') ||
    getEnv('NG_APP_BACKEND_URL') ||
    ''
  );
}

/**
 * PUBLIC_INTERFACE
 * Parse JSON-like feature flags string, return object with keys.
 * Accepts JSON string or comma-separated list of key[=true|false]
 */
export function parseFlags(raw: string | undefined | null): Record<string, boolean> {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') {
      const out: Record<string, boolean> = {};
      Object.entries(obj as Record<string, any>).forEach(([k, v]) => (out[k] = !!v));
      return out;
    }
  } catch {
    // fallback to CSV format: "recommended=true,live_deals"
    const out: Record<string, boolean> = {};
    raw.split(',').map(s => s.trim()).filter(Boolean).forEach(token => {
      const [k, v] = token.split('=').map(t => t?.trim());
      out[k] = v === undefined ? true : (v === 'true' || v === '1');
    });
    return out;
  }
  return {};
}
