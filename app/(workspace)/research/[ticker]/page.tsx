import { notFound } from "next/navigation";
import { getWorkspace } from "@/lib/workspace";
import { getAsset } from "@/lib/market-data/provider";
import { symbolKey } from "@/lib/market-data/normalizers";
import { MarketWorkspace } from "@/components/market-workspace";
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
  const data = await getWorkspace();
  const asset = await getAsset(symbol);
  return (
    <MarketWorkspace
      asset={asset}
      saved={data.watchlist.some((i) => i.ticker === asset.quote.data?.symbol)}
    />
  );
}
