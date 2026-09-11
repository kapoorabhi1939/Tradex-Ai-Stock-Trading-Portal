import "server-only";
import { cache } from "react";
import { twelveData } from "./twelve-data";
import { symbolKey } from "./normalizers";
export const market = twelveData;
export const getAsset = cache(async (input: string) => {
  const symbol = symbolKey(input);
  const [quotes, history] = await Promise.all([
    market.quotes([symbol]),
    market.history(symbol),
  ]);
  return { symbol, quote: quotes[symbol], history };
});
