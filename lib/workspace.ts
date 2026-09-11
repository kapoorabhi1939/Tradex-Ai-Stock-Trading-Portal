import "server-only";
import { cache } from "react";
import { requireUser } from "./auth";
import type { Holding } from "./portfolio";
import type { AlertRule, TriggeredAlert } from "./alerts";

function workspaceError() {
  return new Error(
    "Your workspace could not be loaded. Check the Supabase connection and apply the database migration, then retry.",
  );
}

export const getAccount = cache(async () => {
  const { db, user } = await requireUser();
  const profile = await db
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profile.error) throw workspaceError();
  return {
    email: user.email,
    displayName: profile.data?.display_name as string | undefined,
  };
});

export const getWatchlist = cache(async () => {
  const { db, user } = await requireUser();
  const result = await db
    .from("watchlist_items")
    .select("id,ticker")
    .eq("user_id", user.id)
    .order("created_at");
  if (result.error) throw workspaceError();
  return (result.data ?? []) as { id: string; ticker: string }[];
});

export const getHoldings = cache(async () => {
  const { db, user } = await requireUser();
  const result = await db
    .from("portfolio_holdings")
    .select("id,ticker,shares,average_cost")
    .eq("user_id", user.id)
    .order("created_at");
  if (result.error) throw workspaceError();
  return ((result.data ?? []) as Holding[]).map((holding) => ({
    ...holding,
    shares: Number(holding.shares),
    average_cost: Number(holding.average_cost),
  }));
});

export const getAlertWorkspace = cache(async () => {
  const { db, user } = await requireUser();
  const [rulesResult, activityResult] = await Promise.all([
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
  if (rulesResult.error || activityResult.error) throw workspaceError();
  return {
    rules: ((rulesResult.data ?? []) as AlertRule[]).map((rule) => ({
      ...rule,
      threshold: rule.threshold === null ? null : Number(rule.threshold),
    })),
    activity: (activityResult.data ?? []) as TriggeredAlert[],
  };
});

export const getWorkspace = cache(async () => {
  const [account, watchlist, holdings, alerts] = await Promise.all([
    getAccount(),
    getWatchlist(),
    getHoldings(),
    getAlertWorkspace(),
  ]);
  return {
    ...account,
    watchlist,
    holdings,
    rules: alerts.rules,
    activity: alerts.activity,
  };
});
