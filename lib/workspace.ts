import "server-only";
import { cache } from "react";
import { requireUser } from "./auth";
import type { Holding } from "./portfolio";
import type { AlertRule, TriggeredAlert } from "./alerts";
export const getWorkspace = cache(async () => {
  const { db, user } = await requireUser();
  const results = await Promise.all([
    db.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    db
      .from("watchlist_items")
      .select("id,ticker")
      .eq("user_id", user.id)
      .order("created_at"),
    db
      .from("portfolio_holdings")
      .select("id,ticker,shares,average_cost")
      .eq("user_id", user.id)
      .order("created_at"),
    db
      .from("alert_rules")
      .select("id,ticker,condition_type,threshold,enabled")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    db
      .from("triggered_alerts")
      .select("id,ticker,message,triggered_at")
      .eq("user_id", user.id)
      .order("triggered_at", { ascending: false })
      .limit(50),
  ]);
  if (results.some((r) => r.error))
    throw new Error(
      "Your workspace could not be loaded. Check the Supabase connection and apply the database migration, then retry.",
    );
  return {
    email: user.email ?? "",
    displayName: results[0].data?.display_name as string | undefined,
    watchlist: (results[1].data ?? []) as { id: string; ticker: string }[],
    holdings: ((results[2].data ?? []) as Holding[]).map((h) => ({
      ...h,
      shares: Number(h.shares),
      average_cost: Number(h.average_cost),
    })),
    rules: ((results[3].data ?? []) as AlertRule[]).map((r) => ({
      ...r,
      threshold: r.threshold === null ? null : Number(r.threshold),
    })),
    activity: (results[4].data ?? []) as TriggeredAlert[],
  };
});
