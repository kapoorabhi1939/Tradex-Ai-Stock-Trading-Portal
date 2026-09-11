import { MarketDataError, providerError } from "./errors";
import type {
  MarketInstrument,
  MarketQuote,
  MarketCandle,
  InstrumentType,
} from "./types";
type Row = Record<string, unknown>;
function row(value: unknown): Row {
  providerError(value);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new MarketDataError("invalid_response");
  return value as Row;
}
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
export function numeric(v: unknown): number | null {
  if (
    (typeof v !== "number" && typeof v !== "string") ||
    String(v).trim() === ""
  )
    return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
export function symbolKey(value: string) {
  const symbol = value.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9./:^_-]{0,49}$/.test(symbol))
    throw new MarketDataError("not_found");
  return symbol;
}
export function instrumentType(value: unknown): InstrumentType {
  const t = text(value).toLowerCase();
  if (t.includes("etf")) return "ETF";
  if (t.includes("stock") || t.includes("equity")) return "Equity";
  if (t.includes("commodity")) return "Commodity";
  if (t.includes("crypto") || t.includes("digital currency")) return "Crypto";
  if (t.includes("currency") || t.includes("forex")) return "Forex";
  if (t.includes("index")) return "Index";
  if (t.includes("future")) return "Future";
  return "Other";
}
export function instrument(value: unknown): MarketInstrument {
  const r = row(value);
  const symbol = symbolKey(text(r.symbol));
  return {
    symbol,
    name: text(r.name ?? r.instrument_name) || symbol,
    exchange: text(r.exchange),
    currency: text(r.currency ?? r.currency_quote),
    country: text(r.country),
    type: instrumentType(r.type ?? r.instrument_type),
    micCode: text(r.mic_code) || undefined,
  };
}
export function normalizeQuote(value: unknown): MarketQuote {
  const r = row(value),
    meta = instrument(r),
    price = numeric(r.close ?? r.price),
    previousClose = numeric(r.previous_close);
  if (price === null || price <= 0)
    throw new MarketDataError("invalid_response");
  const stamp = numeric(r.timestamp);
  if (stamp === null || !Number.isFinite(new Date(stamp * 1000).getTime()))
    throw new MarketDataError("invalid_response");
  return {
    ...meta,
    price,
    previousClose,
    change: previousClose !== null ? price - previousClose : numeric(r.change),
    percentChange:
      previousClose && previousClose > 0
        ? (price / previousClose - 1) * 100
        : numeric(r.percent_change),
    open: numeric(r.open),
    high: numeric(r.high),
    low: numeric(r.low),
    volume: numeric(r.volume),
    timestamp: new Date(stamp * 1000).toISOString(),
    marketOpen: typeof r.is_market_open === "boolean" ? r.is_market_open : null,
  };
}
export function normalizeHistory(value: unknown): MarketCandle[] {
  const r = row(value);
  if (!Array.isArray(r.values) || !r.values.length)
    throw new MarketDataError("invalid_response");
  const bars = r.values.map((value) => {
    const b = row(value);
    const date = text(b.datetime);
    const open = numeric(b.open),
      high = numeric(b.high),
      low = numeric(b.low),
      close = numeric(b.close);
    if (
      !/^\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2}:\d{2})?$/.test(date) ||
      open === null ||
      high === null ||
      low === null ||
      close === null ||
      Math.min(open, high, low, close) <= 0 ||
      high < Math.max(open, close, low) ||
      low > Math.min(open, close, high)
    )
      throw new MarketDataError("invalid_response");
    return { date, open, high, low, close, volume: numeric(b.volume) };
  });
  return [...new Map(bars.map((b) => [b.date, b])).values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
export function normalizeSearch(value: unknown): MarketInstrument[] {
  const r = row(value);
  if (!Array.isArray(r.data)) throw new MarketDataError("invalid_response");
  return r.data
    .flatMap((v) => {
      try {
        return [instrument(v)];
      } catch {
        return [];
      }
    })
    .slice(0, 20);
}
