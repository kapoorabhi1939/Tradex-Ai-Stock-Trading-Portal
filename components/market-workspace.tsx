import { marketMoney } from "@/lib/format";
import { MarketRetry } from "./market-retry";
import { Plus, Check } from "lucide-react";
import type {
  MarketAsset,
  MarketResult,
  MarketQuote,
} from "@/lib/market-data/types";
import { technicalSignal } from "@/lib/market-data/analytics";
import { canSaveSymbol } from "@/lib/market-data/saved-symbols";
import { PriceChart } from "./charts";
import { SignalPanel } from "./signal-panel";
import { Panel, Change } from "./ui";
import { InstrumentSearch } from "./instrument-search";
import { ActionForm } from "./action-form";
import { addWatchlist } from "@/app/actions/workspace";
export function quotePrice(q: MarketQuote) {
  return marketMoney(
    q.price,
    q.currency,
    q.symbol.includes("/") ? 5 : undefined,
  );
}
export function Freshness({ result }: { result: MarketResult<MarketQuote> }) {
  return (
    <span className={"freshness" + (result.stale ? " stale" : "")}>
      {result.stale
        ? "Cached · "
        : result.data?.marketOpen === false
          ? "Market closed · "
          : ""}
      {result.data
        ? "As of " +
          result.data.timestamp.replace("T", " ").slice(0, 16) +
          " UTC"
        : "Unavailable"}
    </span>
  );
}
export function MarketWorkspace({
  asset,
  saved = false,
  lens = false,
}: {
  asset: MarketAsset;
  saved?: boolean;
  lens?: boolean;
}) {
  const q = asset.quote.data,
    signal = asset.history.data
      ? technicalSignal(asset.symbol, asset.history.data)
      : null;
  const symbol = q?.symbol ?? asset.symbol;
  const saveEligible =
    !!q &&
    canSaveSymbol(symbol) &&
    q.currency === "USD" &&
    ["NASDAQ", "NYSE"].includes(q.exchange.toUpperCase());
  return (
    <>
      <div className="lens-heading">
        <div>
          <span className="eyebrow">
            {lens ? "MARKET LENS" : "INSTRUMENT RESEARCH"}
          </span>
          <h2>
            {lens ? "Your market, in focus." : "The details behind the move."}
          </h2>
        </div>
        {lens && <InstrumentSearch lens />}
      </div>
      <div className="analysis-grid">
        <Panel className="main-chart-panel">
          <div className="instrument-header">
            <div className="instrument-identity">
              <span className="symbol-mark large">{symbol.slice(0, 2)}</span>
              <div>
                <h1>{q?.name ?? symbol}</h1>
                <p>
                  {[
                    symbol,
                    q?.exchange,
                    q?.type === "Other" ? null : q?.type,
                    q?.currency,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            <div>
              {saved && saveEligible ? (
                <span className="saved-label">
                  <Check size={15} /> In watchlist
                </span>
              ) : saveEligible ? (
                <ActionForm
                  action={addWatchlist}
                  label={
                    <>
                      <Plus size={14} /> Watchlist
                    </>
                  }
                  buttonClass="secondary small-button"
                >
                  <input type="hidden" name="ticker" value={symbol} />
                </ActionForm>
              ) : (
                <span className="muted small">Research access</span>
              )}
            </div>
          </div>
          {q ? (
            <>
              <div className="quote-line">
                <strong>{quotePrice(q)}</strong>
                {q.percentChange !== null && <Change value={q.percentChange} />}
                <span
                  className={
                    q.change !== null && q.change < 0 ? "negative" : "positive"
                  }
                >
                  {q.change !== null
                    ? (q.change >= 0 ? "+" : "") +
                      q.change.toFixed(q.symbol.includes("/") ? 5 : 2)
                    : "—"}
                </span>
              </div>
              <Freshness result={asset.quote} />
            </>
          ) : (
            <div className="market-unavailable" role="status">
              <h3>Market data temporarily unavailable</h3>
              <p>{asset.quote.error ?? "Please try again shortly."}</p>
              <MarketRetry />
            </div>
          )}
          {asset.history.data?.length ? (
            <PriceChart
              key={asset.symbol}
              symbol={symbol}
              currency={q?.currency || ""}
              bars={asset.history.data}
            />
          ) : (
            <div className="chart-unavailable">
              <span>Price history unavailable</span>
              <p>
                {asset.history.error ??
                  "Historical prices will appear when available."}
              </p>
            </div>
          )}
          {asset.history.stale && (
            <p className="freshness stale">
              Showing previously retrieved history ·{" "}
              {asset.history.fetchedAt?.slice(0, 16).replace("T", " ")} UTC
            </p>
          )}
          <div className="market-facts">
            {[
              ["Open", q?.open],
              ["Previous close", q?.previousClose],
              ["Day high", q?.high],
              ["Day low", q?.low],
              ["Volume", q?.volume],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <span>{label}</span>
                <strong>
                  {typeof value === "number"
                    ? new Intl.NumberFormat("en-US", {
                        maximumFractionDigits:
                          label === "Volume" ? 0 : symbol.includes("/") ? 5 : 2,
                      }).format(value)
                    : "—"}
                </strong>
              </div>
            ))}
          </div>
        </Panel>
        <SignalPanel signal={signal} />
      </div>
    </>
  );
}
