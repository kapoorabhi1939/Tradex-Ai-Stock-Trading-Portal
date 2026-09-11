import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import type { QuoteMap } from "@/lib/market-data/types";
import { removeWatchlist } from "@/app/actions/workspace";
import { ActionForm } from "./action-form";
import { Change, EmptyState } from "./ui";
import { quotePrice, Freshness } from "./market-workspace";
export function Watchlist({
  items,
  quotes,
}: {
  items: { id: string; ticker: string }[];
  quotes: QuoteMap;
}) {
  return items.length ? (
    <div className="live-watchlist">
      {items.map((item) => {
        const result = quotes[item.ticker],
          q = result?.data;
        return (
          <div className="watch-row" key={item.id}>
            <Link href={"/research/" + encodeURIComponent(item.ticker)}>
              <span className="symbol-mark">{item.ticker.slice(0, 2)}</span>
              <span>
                <strong>{item.ticker}</strong>
                <small>{q?.name ?? "Saved instrument"}</small>
              </span>
              <ArrowUpRight size={14} />
            </Link>
            <div className="watch-price">
              <strong>{q ? quotePrice(q) : "—"}</strong>
              {q?.percentChange !== null && q?.percentChange !== undefined && (
                <Change value={q.percentChange} />
              )}{" "}
              {result && <Freshness result={result} />}
            </div>
            <ActionForm
              action={removeWatchlist}
              label={<X size={14} />}
              accessibleLabel={"Remove " + item.ticker}
              buttonClass="icon-button"
              pendingLabel="…"
            >
              <input type="hidden" name="id" value={item.id} />
            </ActionForm>
          </div>
        );
      })}
    </div>
  ) : (
    <EmptyState
      title="Follow your next idea"
      href="/research"
      link="Explore instruments"
    >
      Save an instrument from research to keep it close.
    </EmptyState>
  );
}
