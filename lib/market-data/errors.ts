export type ErrorCode =
  | "configuration"
  | "rate_limit"
  | "unavailable"
  | "not_found"
  | "invalid_response";
export class MarketDataError extends Error {
  constructor(public code: ErrorCode) {
    super(
      code === "configuration"
        ? "Market data is not configured."
        : code === "rate_limit"
          ? "Market data is busy. Please try again shortly."
          : code === "not_found"
            ? "Instrument not found or unavailable on this connection."
            : "Market data temporarily unavailable.",
    );
  }
}
export function providerError(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "status" in value &&
    value.status === "error"
  ) {
    const code = "code" in value ? Number(value.code) : 500;
    throw new MarketDataError(
      code === 429
        ? "rate_limit"
        : code === 400 || code === 404
          ? "not_found"
          : "unavailable",
    );
  }
}
