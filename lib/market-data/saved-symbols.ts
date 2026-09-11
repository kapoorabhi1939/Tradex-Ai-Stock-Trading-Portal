// Matches the existing database CHECK constraints; research is not restricted by this list.
export const SAVED_SYMBOLS = [
  "AAPL",
  "NVDA",
  "MSFT",
  "AMZN",
  "TSLA",
  "META",
  "GOOGL",
  "JPM",
  "JNJ",
  "XOM",
  "PG",
  "CAT",
] as const;
export const canSaveSymbol = (symbol: string) =>
  (SAVED_SYMBOLS as readonly string[]).includes(symbol);
