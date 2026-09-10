import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Execute the actual migration in embedded PostgreSQL. Simulate auth.uid() only;
// this is not an application authentication path and does not replace Supabase QA.
test("migration, ownership isolation, constraints, persistence, and alert deduplication", async (t) => {
  const db = new PGlite();
  const alice = "11111111-1111-4111-8111-111111111111",
    bob = "22222222-2222-4222-8222-222222222222";
  const list = "33333333-3333-4333-8333-333333333333",
    rule = "44444444-4444-4444-8444-444444444444";
  try {
    await db.exec(
      `create role authenticated; create role anon; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon; insert into auth.users values ('${alice}'),('${bob}');`,
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609100001_tradex_mvp.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(
      `set role authenticated; set request.jwt.claim.sub='${alice}';`,
    );
    await db.exec(
      `insert into profiles(id,display_name) values ('${alice}','Alice'); insert into watchlists(id,user_id,name) values ('${list}','${alice}','My watchlist'); insert into watchlist_items(user_id,watchlist_id,ticker) values ('${alice}','${list}','AAPL'); insert into portfolio_holdings(user_id,ticker,shares,average_cost) values ('${alice}','AAPL',2,200); insert into alert_rules(id,user_id,ticker,condition_type,threshold) values ('${rule}','${alice}','AAPL','price_above',200); insert into triggered_alerts(user_id,alert_rule_id,ticker,trigger_value,message,dataset_version) values ('${alice}','${rule}','AAPL',228.64,'Matched','v1');`,
    );
    await t.test("owner can read all six tables", async () => {
      for (const table of [
        "profiles",
        "watchlists",
        "watchlist_items",
        "portfolio_holdings",
        "alert_rules",
        "triggered_alerts",
      ])
        assert.equal((await db.query(`select * from ${table}`)).rows.length, 1);
    });
    await t.test(
      "same snapshot cannot insert duplicate history even through upsert",
      async () => {
        const result = await db.query(
          `insert into triggered_alerts(user_id,alert_rule_id,ticker,trigger_value,message,dataset_version) values ('${alice}','${rule}','AAPL',228.64,'Matched','v1') on conflict(alert_rule_id,dataset_version) do nothing returning id;`,
        );
        assert.equal(result.rows.length, 0);
      },
    );
    await t.test("owner can edit holding and pause rule", async () => {
      await db.exec(
        `update portfolio_holdings set shares=3 where user_id='${alice}'; update alert_rules set enabled=false where id='${rule}';`,
      );
      assert.equal(
        Number(
          (
            await db.query<{ shares: string }>(
              "select shares from portfolio_holdings",
            )
          ).rows[0].shares,
        ),
        3,
      );
      assert.equal(
        (
          await db.query<{ enabled: boolean }>(
            "select enabled from alert_rules",
          )
        ).rows[0].enabled,
        false,
      );
    });
    await t.test(
      "invalid values and duplicate holdings are rejected",
      async () => {
        for (const sql of [
          `insert into portfolio_holdings(user_id,ticker,shares,average_cost) values ('${alice}','AAPL',1,100)`,
          `insert into portfolio_holdings(user_id,ticker,shares,average_cost) values ('${alice}','JPM',-1,100)`,
          `insert into portfolio_holdings(user_id,ticker,shares,average_cost) values ('${alice}','FAKE',1,100)`,
          `insert into alert_rules(user_id,ticker,condition_type,threshold) values ('${alice}','NVDA','confidence_above',101)`,
        ])
          await assert.rejects(db.exec(sql));
      },
    );
    await db.exec(`set request.jwt.claim.sub='${bob}';`);
    await t.test(
      "a second user cannot see any of the first user's records",
      async () => {
        for (const table of [
          "profiles",
          "watchlists",
          "watchlist_items",
          "portfolio_holdings",
          "alert_rules",
          "triggered_alerts",
        ])
          assert.equal(
            (await db.query(`select * from ${table}`)).rows.length,
            0,
          );
      },
    );
    await t.test("cross-user updates and deletes affect no rows", async () => {
      for (const table of [
        "profiles",
        "watchlists",
        "watchlist_items",
        "portfolio_holdings",
        "alert_rules",
      ])
        assert.equal(
          (await db.query(`delete from ${table} returning *`)).rows.length,
          0,
        );
      assert.equal(
        (await db.query(`update portfolio_holdings set shares=99 returning *`))
          .rows.length,
        0,
      );
    });
    await t.test(
      "cross-user insert and parent-link injection are rejected",
      async () => {
        await assert.rejects(
          db.exec(
            `insert into profiles(id,display_name) values ('${alice}','Impersonation')`,
          ),
        );
        await assert.rejects(
          db.exec(
            `insert into portfolio_holdings(user_id,ticker,shares,average_cost) values ('${alice}','JPM',1,100)`,
          ),
        );
        await assert.rejects(
          db.exec(
            `insert into watchlist_items(user_id,watchlist_id,ticker) values ('${bob}','${list}','MSFT')`,
          ),
        );
        await assert.rejects(
          db.exec(
            `insert into triggered_alerts(user_id,alert_rule_id,ticker,trigger_value,message,dataset_version) values ('${bob}','${rule}','AAPL',1,'Forged','v2')`,
          ),
        );
      },
    );
    await t.test("anonymous role cannot read or write user data", async () => {
      await db.exec("reset role; set role anon;");
      for (const table of [
        "profiles",
        "watchlists",
        "watchlist_items",
        "portfolio_holdings",
        "alert_rules",
        "triggered_alerts",
      ])
        await assert.rejects(db.query(`select * from ${table}`));
      await assert.rejects(
        db.exec(`insert into profiles(id) values ('${bob}')`),
      );
    });
    await db.exec(
      `reset role; set role authenticated; set request.jwt.claim.sub='${alice}';`,
    );
    await t.test(
      "records survive identity changes and history is immutable",
      async () => {
        assert.equal(
          (await db.query("select * from portfolio_holdings")).rows.length,
          1,
        );
        await assert.rejects(
          db.exec("update triggered_alerts set message='changed'"),
        );
      },
    );
    await t.test(
      "deleting an owned rule cascades only its history",
      async () => {
        await db.exec(`delete from alert_rules where id='${rule}'`);
        assert.equal(
          (await db.query("select * from triggered_alerts")).rows.length,
          0,
        );
        assert.equal(
          (await db.query("select * from portfolio_holdings")).rows.length,
          1,
        );
      },
    );
  } finally {
    await db.close();
  }
});
