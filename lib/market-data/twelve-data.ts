import { fetchMarketJson } from "./transport";
import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { MarketCache, CACHE_POLICY } from "./cache";
import { MarketDataError } from "./errors";
import {
  normalizeQuote,
  normalizeHistory,
  normalizeSearch,
  symbolKey,
} from "./normalizers";
import type { MarketProvider, MarketQuote, MarketResult } from "./types";
const globals = globalThis as typeof globalThis & {
  tradexMarket?: {
    cache: MarketCache;
    requests: number[];
    blockedUntil: number;
    day: string;
    daily: number;
  };
};
const state = (globals.tradexMarket ??= {
  cache: new MarketCache(),
  requests: [],
  blockedUntil: 0,
  day: "",
  daily: 0,
});
const root = path.join(process.cwd(), ".cache", "tradex-market");
async function cached<T>(key: string, ttl: number, loader: () => Promise<T>) {
  if (!process.env.TWELVE_DATA_API_KEY) {
    if (process.env.NODE_ENV !== "production")
      console.warn(
        "Market configuration: set TWELVE_DATA_API_KEY in .env.local.",
      );
    return {
      data: null,
      stale: false,
      fetchedAt: null,
      error: new MarketDataError("configuration").message,
    };
  }
  const file = path.join(
    root,
    createHash("sha256").update(key).digest("hex") + ".json",
  );
  if (!state.cache.peek(key)) {
    try {
      const value = JSON.parse(await readFile(file, "utf8"));
      if (value.time && value.data) state.cache.seed(key, value);
    } catch {}
  }
  return state.cache.get(key, ttl, loader, async (entry) => {
    try {
      await mkdir(root, { recursive: true });
      await writeFile(file, JSON.stringify(entry));
    } catch {
      /* Read-only hosts retain the bounded process cache. */
    }
  });
}
async function request(
  endpoint: string,
  params: Record<string, string>,
  credits = 1,
): Promise<unknown> {
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production")
      console.warn(
        "Market configuration: set TWELVE_DATA_API_KEY in .env.local.",
      );
    throw new MarketDataError("configuration");
  }
  const now = Date.now();
  state.requests = state.requests.filter((t) => now - t < 60_000);
  const day = new Date(now).toISOString().slice(0, 10);
  if (state.day !== day) {
    state.day = day;
    state.daily = 0;
  }
  if (
    now < state.blockedUntil ||
    state.requests.length + credits > CACHE_POLICY.creditsPerMinute ||
    state.daily + credits > 750
  )
    throw new MarketDataError("rate_limit");
  state.requests.push(...Array<number>(credits).fill(now));
  state.daily += credits;
  try {
    return await fetchMarketJson(endpoint, params, key);
  } catch (error) {
    if (error instanceof MarketDataError && error.code === "rate_limit")
      state.blockedUntil = now + 60_000;
    throw error;
  }
}
// Pending symbol requests share one wire request; credits still count per symbol.
const pending = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: unknown) => void }[]
>();
let timer: ReturnType<typeof setTimeout> | undefined;
function quoteWire(symbol: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const listeners = pending.get(symbol) ?? [];
    listeners.push({ resolve, reject });
    pending.set(symbol, listeners);
    if (!timer)
      timer = setTimeout(async () => {
        timer = undefined;
        const items = [...pending.entries()];
        pending.clear();
        for (let i = 0; i < items.length; i += 7) {
          const batch = items.slice(i, i + 7);
          try {
            const body = await request(
              "quote",
              { symbol: batch.map(([s]) => s).join(",") },
              batch.length,
            );
            for (const [s, listeners] of batch) {
              const item =
                batch.length === 1
                  ? body
                  : (body as Record<string, unknown>)[s];
              listeners.forEach((l) => l.resolve(item));
            }
          } catch (error) {
            batch.forEach(([, listeners]) =>
              listeners.forEach((l) => l.reject(error)),
            );
          }
        }
      }, 20);
  });
}
export const twelveData: MarketProvider = {
  async quotes(symbols) {
    const unique = [...new Set(symbols.map(symbolKey))];
    const results = await Promise.all(
      unique.map(
        async (symbol) =>
          [
            symbol,
            await cached<MarketQuote>(
              "quote:" + symbol,
              CACHE_POLICY.quote,
              async () => normalizeQuote(await quoteWire(symbol)),
            ),
          ] as const,
      ),
    );
    return Object.fromEntries(results);
  },
  history(symbol) {
    symbol = symbolKey(symbol);
    return cached("daily:" + symbol, CACHE_POLICY.history, async () =>
      normalizeHistory(
        await request("time_series", {
          symbol,
          interval: "1day",
          outputsize: "260",
          order: "ASC",
          timezone: "UTC",
        }),
      ),
    );
  },
  search(query) {
    const q = query.trim().replace(/\s+/g, " ").slice(0, 80);
    return cached("search:" + q.toLowerCase(), CACHE_POLICY.search, async () =>
      normalizeSearch(
        await request("symbol_search", { symbol: q, outputsize: "20" }),
      ),
    );
  },
};
export async function latestQuote(
  symbol: string,
): Promise<MarketResult<MarketQuote>> {
  return (await twelveData.quotes([symbol]))[symbolKey(symbol)];
}
