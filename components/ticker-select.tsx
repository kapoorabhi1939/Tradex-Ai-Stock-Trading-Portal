import { SAVED_SYMBOLS } from "@/lib/market-data/saved-symbols";
export function TickerSelect({ defaultValue }: { defaultValue?: string }) {
  return (
    <label>
      Equity
      <select name="ticker" defaultValue={defaultValue ?? "AAPL"}>
        {SAVED_SYMBOLS.map((symbol) => (
          <option key={symbol} value={symbol}>
            {symbol}
          </option>
        ))}
      </select>
    </label>
  );
}
