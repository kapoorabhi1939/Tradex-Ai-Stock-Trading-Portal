"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  alertFields,
  idField,
  numberField,
  textField,
  tickerField,
} from "@/lib/validation";
import type { AlertRule } from "@/lib/alerts/model";
import { market } from "@/lib/market-data/provider";
import {
  technicalSignal,
  evaluateMarketRule,
} from "@/lib/market-data/analytics";
import type { FormState } from "./auth";

function databaseError(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === "23505")
    throw new Error("That equity or rule is already saved.");
  throw new Error(
    "Could not save the change. Check your connection and database setup, then retry.",
  );
}
function refresh() {
  revalidatePath("/", "layout");
}
async function mutation(run: () => Promise<string>): Promise<FormState> {
  try {
    const success = await run();
    refresh();
    return { success };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "The change could not be saved.",
    };
  }
}
export async function addWatchlist(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const ticker = tickerField(form);
    const list = await db
      .from("watchlists")
      .upsert(
        { user_id: user.id, name: "My watchlist" },
        { onConflict: "user_id,name" },
      )
      .select("id")
      .single();
    databaseError(list.error);
    const result = await db
      .from("watchlist_items")
      .insert({ watchlist_id: list.data!.id, user_id: user.id, ticker });
    databaseError(result.error);
    return `${ticker} added to your watchlist.`;
  });
}
export async function removeWatchlist(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const result = await db
      .from("watchlist_items")
      .delete()
      .eq("id", idField(form))
      .eq("user_id", user.id)
      .select("id")
      .single();
    databaseError(result.error);
    return "Removed from your watchlist.";
  });
}
export async function saveHolding(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const payload = {
      ticker: tickerField(form),
      shares: numberField(form, "shares", 0.000001, 100000000),
      average_cost: numberField(form, "average_cost", 0, 1000000),
    };
    const result = form.get("id")
      ? await db
          .from("portfolio_holdings")
          .update(payload)
          .eq("id", idField(form))
          .eq("user_id", user.id)
          .select("id")
          .single()
      : await db
          .from("portfolio_holdings")
          .insert({ ...payload, user_id: user.id });
    databaseError(result.error);
    return `${payload.ticker} holding saved.`;
  });
}
export async function deleteHolding(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const result = await db
      .from("portfolio_holdings")
      .delete()
      .eq("id", idField(form))
      .eq("user_id", user.id)
      .select("id")
      .single();
    databaseError(result.error);
    return "Holding removed.";
  });
}
export async function createAlert(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const result = await db
      .from("alert_rules")
      .insert({ ...alertFields(form), user_id: user.id });
    databaseError(result.error);
    return "Alert rule saved. Evaluate alerts to check current market conditions.";
  });
}
export async function updateAlert(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const { ticker, condition_type, threshold } = alertFields(form);
    const result = await db
      .from("alert_rules")
      .update({ condition_type, threshold })
      .eq("id", idField(form))
      .eq("user_id", user.id)
      .eq("ticker", ticker)
      .select("id")
      .single();
    databaseError(result.error);
    return "Alert rule updated. Recorded history is unchanged.";
  });
}
export async function toggleAlert(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const enabled = form.get("enabled");
    if (enabled !== "true" && enabled !== "false")
      throw new Error("Invalid alert state.");
    const result = await db
      .from("alert_rules")
      .update({ enabled: enabled === "true" })
      .eq("id", idField(form))
      .eq("user_id", user.id)
      .select("id")
      .single();
    databaseError(result.error);
    return `Rule ${enabled === "true" ? "enabled" : "paused"}.`;
  });
}
export async function deleteAlert(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const result = await db
      .from("alert_rules")
      .delete()
      .eq("id", idField(form))
      .eq("user_id", user.id)
      .select("id")
      .single();
    databaseError(result.error);
    return "Rule and its associated history removed.";
  });
}
export async function evaluateAlerts(_: FormState) {
  void _;
  const { db, user } = await requireUser();
  return mutation(async () => {
    const result = await db
      .from("alert_rules")
      .select("id,ticker,condition_type,threshold,enabled")
      .eq("user_id", user.id)
      .eq("enabled", true);
    databaseError(result.error);
    const rules = result.data as AlertRule[];
    const quotes = await market.quotes(rules.map((r) => r.ticker));
    const historySymbols = [
      ...new Set(
        rules
          .filter((r) => !r.condition_type.startsWith("price_"))
          .map((r) => r.ticker),
      ),
    ];
    const histories = Object.fromEntries(
      await Promise.all(
        historySymbols.map(async (symbol) => [
          symbol,
          await market.history(symbol),
        ]),
      ),
    );
    let skipped = 0;
    const matches = rules.flatMap((rule) => {
      const quote = quotes[rule.ticker];
      const history = histories[rule.ticker];
      if (
        !quote?.data ||
        quote.stale ||
        (!rule.condition_type.startsWith("price_") &&
          (!history?.data || history.stale))
      ) {
        skipped++;
        return [];
      }
      const signal = history?.data
        ? technicalSignal(rule.ticker, history.data)
        : null;
      if (!rule.condition_type.startsWith("price_") && !signal) {
        skipped++;
        return [];
      }
      const match = evaluateMarketRule(
        {
          ...rule,
          threshold: rule.threshold === null ? null : Number(rule.threshold),
        },
        quote.data,
        signal,
      );
      return match
        ? [
            {
              ...match,
              user_id: user.id,
              alert_rule_id: rule.id,
              ticker: rule.ticker,
            },
          ]
        : [];
    });
    if (!matches.length)
      return (
        "Evaluation complete. No new matches. " +
        skipped +
        " rules skipped because market inputs were unavailable."
      );
    const saved = await db
      .from("triggered_alerts")
      .upsert(matches, {
        onConflict: "alert_rule_id,dataset_version",
        ignoreDuplicates: true,
      })
      .select("id");
    databaseError(saved.error);
    return `Evaluation complete. ${saved.data?.length ?? 0} new matches recorded; previously recorded matches were skipped. ${skipped} rules lacked current inputs.`;
  });
}
export async function saveProfile(_: FormState, form: FormData) {
  const { db, user } = await requireUser();
  return mutation(async () => {
    const display_name = textField(form, "display_name", 60);
    if (!display_name) throw new Error("Enter a display name.");
    const result = await db
      .from("profiles")
      .upsert({ id: user.id, display_name });
    databaseError(result.error);
    return "Profile updated.";
  });
}
