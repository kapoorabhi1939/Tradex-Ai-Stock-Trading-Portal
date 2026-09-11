import type { MarketResult } from "./types";
import { MarketDataError } from "./errors";
export const CACHE_POLICY = {
  quote: 60_000,
  search: 600_000,
  history: 3_600_000,
  stale: 86_400_000,
  failure: 60_000,
  maxEntries: 500,
  creditsPerMinute: 7,
};
type Entry<T> = { data: T; time: number };
export class MarketCache {
  private values = new Map<string, Entry<unknown>>();
  private flights = new Map<string, Promise<MarketResult<unknown>>>();
  private failures = new Map<string, { until: number; error: string }>();
  constructor(private now: () => number = Date.now) {}
  seed(key: string, entry: Entry<unknown>) {
    this.values.set(key, entry);
    if (this.values.size > CACHE_POLICY.maxEntries)
      this.values.delete(this.values.keys().next().value!);
  }
  peek<T>(key: string) {
    return this.values.get(key) as Entry<T> | undefined;
  }
  async get<T>(
    key: string,
    ttl: number,
    loader: () => Promise<T>,
    persist?: (entry: Entry<T>) => Promise<void>,
  ): Promise<MarketResult<T>> {
    const old = this.peek<T>(key),
      now = this.now();
    if (old && now - old.time < ttl)
      return {
        data: old.data,
        stale: false,
        fetchedAt: new Date(old.time).toISOString(),
        error: null,
      };
    const flight = this.flights.get(key);
    if (flight) return flight as Promise<MarketResult<T>>;
    const fallback = (error: string): MarketResult<T> => ({
      data: old && now - old.time < CACHE_POLICY.stale ? old.data : null,
      stale: !!old && now - old.time < CACHE_POLICY.stale,
      fetchedAt: old ? new Date(old.time).toISOString() : null,
      error,
    });
    const failed = this.failures.get(key);
    if (failed && failed.until > now) return fallback(failed.error);
    const task = (async () => {
      try {
        const data = await loader();
        const entry = { data, time: this.now() };
        this.seed(key, entry);
        this.failures.delete(key);
        await persist?.(entry);
        return {
          data,
          stale: false,
          fetchedAt: new Date(entry.time).toISOString(),
          error: null,
        };
      } catch (error) {
        const message =
          error instanceof MarketDataError
            ? error.message
            : "Market data temporarily unavailable.";
        this.failures.set(key, {
          until: this.now() + CACHE_POLICY.failure,
          error: message,
        });
        if (this.failures.size > CACHE_POLICY.maxEntries)
          this.failures.delete(this.failures.keys().next().value!);
        return fallback(message);
      } finally {
        this.flights.delete(key);
      }
    })();
    this.flights.set(key, task);
    return task;
  }
}
