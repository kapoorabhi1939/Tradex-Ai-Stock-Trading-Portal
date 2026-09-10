import Link from "next/link";
import { Plus, X } from "lucide-react";
import { getEquity } from "@/lib/demo-market";
import { calculateSignal } from "@/lib/signals";
import { money } from "@/lib/format";
import { addWatchlist, removeWatchlist } from "@/app/actions/workspace";
import { ActionForm } from "./action-form";
import { TickerSelect } from "./ticker-select";
import { Change, EmptyState, SignalBadge } from "./ui";
export function Watchlist({
  items,
}: {
  items: { id: string; ticker: string }[];
}) {
  return (
    <>
      <ActionForm
        action={addWatchlist}
        className="inline-form watchlist-add"
        label={
          <>
            <Plus size={16} /> Add
          </>
        }
      >
        <TickerSelect />
      </ActionForm>
      {!items.length ? (
        <EmptyState title="Make the market your own">
          Add an equity to start following its price, calculated signal, and
          research. Your watchlist stays with your account.
        </EmptyState>
      ) : (
        <div className="watchlist-rows">
          {items.map((item) => {
            const e = getEquity(item.ticker);
            if (!e) return null;
            return (
              <div className="watch-row" key={item.id}>
                <Link href={`/research/${e.ticker}`} className="symbol-cell">
                  <span className="ticker-icon">{e.ticker.slice(0, 1)}</span>
                  <span>
                    <strong>{e.ticker}</strong>
                    <small>{e.name}</small>
                  </span>
                </Link>
                <div className="watch-price">
                  <strong>{money(e.price)}</strong>
                  <Change value={e.change} />
                </div>
                <SignalBadge signal={calculateSignal(e).signal} />
                <ActionForm
                  action={removeWatchlist}
                  label={<X size={14} />}
                  accessibleLabel={`Remove ${e.ticker} from watchlist`}
                  pendingLabel="…"
                  buttonClass="icon-button subtle"
                >
                  <input type="hidden" name="id" value={item.id} />
                </ActionForm>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
