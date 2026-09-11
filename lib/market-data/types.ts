export type InstrumentType =
  | "Equity"
  | "ETF"
  | "Forex"
  | "Crypto"
  | "Commodity"
  | "Index"
  | "Future"
  | "Other";
export type MarketInstrument = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  country: string;
  type: InstrumentType;
  micCode?: string;
};
export type MarketQuote = MarketInstrument & {
  price: number;
  previousClose: number | null;
  change: number | null;
  percentChange: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  timestamp: string;
  marketOpen: boolean | null;
};
export type MarketCandle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};
export type MarketResult<T> = {
  data: T | null;
  stale: boolean;
  fetchedAt: string | null;
  error: string | null;
};
export type QuoteMap = Record<string, MarketResult<MarketQuote>>;
export type MarketAsset = {
  symbol: string;
  quote: MarketResult<MarketQuote>;
  history: MarketResult<MarketCandle[]>;
};
export interface MarketProvider {
  quotes(symbols: string[]): Promise<QuoteMap>;
  history(symbol: string): Promise<MarketResult<MarketCandle[]>>;
  search(query: string): Promise<MarketResult<MarketInstrument[]>>;
}
