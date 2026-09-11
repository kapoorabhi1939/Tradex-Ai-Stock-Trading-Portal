import { notFound } from "next/navigation";
import { getWatchlist } from "@/lib/workspace";
import { getAsset } from "@/lib/market-data/provider";
import { symbolKey } from "@/lib/market-data/normalizers";
import { MarketWorkspace } from "@/components/market-workspace";
import { UpgradePrompt } from "@/components/product-surfaces";
export const metadata = { title: "Research" };
export default async function Research({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  let symbol: string;
  try {
    symbol = symbolKey(decodeURIComponent(ticker));
  } catch {
    notFound();
  }
  const watchlistPromise = getWatchlist();
  const [watchlist, asset] = await Promise.all([
    watchlistPromise,
    getAsset(symbol),
  ]);
  return (
    <>
      <MarketWorkspace
        asset={asset}
        saved={watchlist.some((i) => i.ticker === asset.quote.data?.symbol)}
      />
      <UpgradePrompt compact />
    </>
  );
}
