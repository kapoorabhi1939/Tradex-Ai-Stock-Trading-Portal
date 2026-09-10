import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

// Never log environment values, session cookies, JWTs, or database row contents.
// Optional argument: ignored Playwright storage-state file from the reviewer browser.
process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const tables = [
  "profiles",
  "watchlists",
  "watchlist_items",
  "portfolio_holdings",
  "alert_rules",
  "triggered_alerts",
];
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
function requireCheck(condition, message) {
  if (!condition) throw new Error(message);
}
async function main() {
  requireCheck(Boolean(url && key), "Missing public project configuration.");
  const anonymous = createClient(url, key, options);
  for (const table of tables) {
    const result = await anonymous.from(table).select("id").limit(1);
    requireCheck(
      result.error?.code === "42501",
      `${table}: anonymous access was not rejected by table permissions.`,
    );
    console.log(`PASS live Supabase ${table}: anonymous access denied`);
  }
  if (!process.argv[2]) {
    console.log(
      "Authenticated ownership probes not run: no private browser state supplied.",
    );
    return;
  }
  const state = JSON.parse(await readFile(process.argv[2], "utf8"));
  const authCookies = state.cookies
    .filter((c) => /-auth-token(?:\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  let encoded = authCookies.map((c) => c.value).join("");
  if (encoded.startsWith("base64-"))
    encoded = Buffer.from(encoded.slice(7), "base64url").toString("utf8");
  const session = JSON.parse(encoded);
  requireCheck(
    Boolean(session.access_token),
    "No authenticated browser token was found.",
  );
  const db = createClient(url, key, {
    ...options,
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
  });
  const verified = await db.auth.getUser(session.access_token);
  requireCheck(
    !verified.error && Boolean(verified.data.user),
    "Browser session was not verified by Supabase Auth.",
  );
  const userId = verified.data.user.id;
  for (const table of tables) {
    const ownerField = table === "profiles" ? "id" : "user_id";
    const result = await db.from(table).select(ownerField);
    requireCheck(
      !result.error && result.data.every((row) => row[ownerField] === userId),
      `${table}: ownership visibility check failed.`,
    );
    console.log(
      `PASS live Supabase ${table}: every visible row belongs to the authenticated user`,
    );
  }
  if (process.argv.includes("--reviewer-check")) {
    const [holdings, rules, history, profile, watchlist] = await Promise.all([
      db.from("portfolio_holdings").select("ticker,shares,average_cost"),
      db.from("alert_rules").select("ticker,threshold,enabled"),
      db.from("triggered_alerts").select("ticker"),
      db.from("profiles").select("display_name"),
      db.from("watchlist_items").select("ticker"),
    ]);
    requireCheck(
      [holdings, rules, history, profile, watchlist].every((r) => !r.error),
      "Reviewer queries failed.",
    );
    requireCheck(
      holdings.data.length === 2 &&
        holdings.data.some(
          (r) =>
            r.ticker === "AAPL" &&
            Number(r.shares) === 12 &&
            Number(r.average_cost) === 205,
        ) &&
        holdings.data.some(
          (r) =>
            r.ticker === "JPM" &&
            Number(r.shares) === 5 &&
            Number(r.average_cost) === 210,
        ),
      "Holding database mismatch.",
    );
    requireCheck(
      rules.data.length === 1 &&
        rules.data[0].ticker === "AAPL" &&
        Number(rules.data[0].threshold) === 200 &&
        rules.data[0].enabled,
      "Rule database mismatch.",
    );
    requireCheck(
      history.data.length === 1 && history.data[0].ticker === "AAPL",
      "History database mismatch.",
    );
    requireCheck(
      profile.data.length === 1 &&
        profile.data[0].display_name === "Tradex Reviewer",
      "Profile database mismatch.",
    );
    requireCheck(
      watchlist.data.length === 2 &&
        ["AAPL", "NVDA"].every((t) =>
          watchlist.data.some((r) => r.ticker === t),
        ),
      "Watchlist database mismatch.",
    );
    console.log(
      "PASS reviewer saved holdings, rules, history, profile and watchlist match the browser assertions directly in Supabase.",
    );
  }
  // A forged owner must fail RLS before the foreign-key check; 23503 is not accepted.
  const otherId = randomUUID();
  const forged = await db
    .from("profiles")
    .insert({ id: otherId, display_name: "RLS rejection probe" });
  requireCheck(
    forged.error?.code === "42501",
    "Forged profile ownership did not fail with an RLS rejection.",
  );
  const holding = await db
    .from("portfolio_holdings")
    .insert({ user_id: otherId, ticker: "CAT", shares: 1, average_cost: 1 });
  requireCheck(
    holding.error?.code === "42501",
    "Forged holding ownership did not fail with an RLS rejection.",
  );
  console.log(
    "PASS live Supabase: forged profile and holding ownership rejected by RLS",
  );
  console.log(
    "Limitation: a second real user's existing rows have not been tested by this probe. Two-user SQL isolation is covered separately by npm test.",
  );
}
main().catch(() => {
  console.error(
    "FAIL live Supabase security probe. No environment or session values were logged. Inspect configuration and policies privately.",
  );
  process.exitCode = 1;
});
