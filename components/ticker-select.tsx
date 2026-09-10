import { equities } from "@/lib/demo-market";
export function TickerSelect({
  defaultValue = "AAPL",
}: {
  defaultValue?: string;
}) {
  return (
    <label>
      Equity
      <select name="ticker" defaultValue={defaultValue} required>
        {equities.map((e) => (
          <option key={e.ticker} value={e.ticker}>
            {e.ticker} · {e.name}
          </option>
        ))}
      </select>
    </label>
  );
}
