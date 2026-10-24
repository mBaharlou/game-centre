import { Platform } from 'react-native';

/** Identifies the app to public APIs (Wikimedia and CheapShark ask for this). */
export const APP_AGENT = 'GameCentre/1.0 (+https://github.com/mBaharlou/game-centre)';

const cache = new Map<string, { at: number; value: unknown }>();

type Options = {
  /** How long a successful response is reused, in ms. */
  ttl?: number;
  timeout?: number;
  headers?: Record<string, string>;
};

/**
 * GET a JSON endpoint with a timeout and a small in-memory cache.
 * Browsers don't allow setting User-Agent, so on the web only the extra headers are sent.
 */
export async function getJson<T>(url: string, { ttl = 5 * 60_000, timeout = 12_000, headers = {} }: Options = {}): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < ttl) return hit.value as T;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(Platform.OS === 'web' ? {} : { 'User-Agent': APP_AGENT }), ...headers },
    });
    if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
    const value = (await res.json()) as T;
    cache.set(url, { at: Date.now(), value });
    return value;
  } finally {
    clearTimeout(timer);
  }
}
