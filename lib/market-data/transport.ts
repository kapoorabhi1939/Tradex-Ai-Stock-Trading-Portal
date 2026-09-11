import { MarketDataError, providerError } from "./errors";
export async function fetchMarketJson(
  endpoint: string,
  params: Record<string, string>,
  key: string,
  fetcher: typeof fetch = fetch,
): Promise<unknown> {
  if (!key) throw new MarketDataError("configuration");
  try {
    const response = await fetcher(
      "https://api.twelvedata.com/" +
        endpoint +
        "?" +
        new URLSearchParams(params),
      {
        headers: { Authorization: "apikey " + key },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok)
      throw new MarketDataError(
        response.status === 429
          ? "rate_limit"
          : response.status === 404
            ? "not_found"
            : "unavailable",
      );
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new MarketDataError("invalid_response");
    }
    providerError(value);
    return value;
  } catch (error) {
    if (error instanceof MarketDataError) throw error;
    throw new MarketDataError("unavailable");
  }
}
