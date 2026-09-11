import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PlanBadge, LockedFeature } from "../components/product-surfaces";
import { plans } from "../lib/plans";
import { accountDestinations } from "../lib/navigation";
import { marketCategories } from "../lib/market-categories";
import { MarketingHeader } from "../components/marketing-shell";
import { SignupForm } from "../components/signup-form";
import { validateSignup } from "../lib/signup";
import { emailAllowed } from "../lib/admin-access";
import {
  adminInsights,
  adminSummary,
  adminTotalsAreConsistent,
  adminUsers,
  revenueTrend,
  subscriptionActivity,
  userGrowth,
} from "../lib/admin-demo";
import Pricing from "../app/pricing/page";
import Landing from "../app/page";

test("pricing defines truthful Free, Plus and Pro launch states", () => {
  assert.deepEqual(
    plans.map((plan) => plan.name),
    ["Free", "Plus", "Pro"],
  );
  assert.equal(plans[0].price, "$0");
  assert.equal(plans[1].price, "$9.99");
  assert.equal(plans[2].price, "$19.99");
});

test("plan badge and locked feature explain future entitlement", () => {
  const badge = renderToStaticMarkup(
    createElement(PlanBadge, { plan: "Free" }),
  );
  assert.match(badge, /plan-free/);
  assert.match(badge, />Free</);
  const locked = renderToStaticMarkup(
    createElement(
      LockedFeature,
      { title: "Advanced analytics", plan: "Pro" },
      "Deeper context",
    ),
  );
  assert.match(locked, /Advanced analytics/);
  assert.match(locked, /Explore Tradex/);
  assert.match(locked, /href="\/pricing"/);
});

test("admin destination is absent for normal users", () => {
  assert.equal(
    accountDestinations(false).some((item) => item.href === "/admin"),
    false,
  );
  assert.equal(
    accountDestinations(true).some((item) => item.href === "/admin"),
    true,
  );
});

test("public navigation exposes markets, pricing, sign in and signup", () => {
  const header = renderToStaticMarkup(createElement(MarketingHeader));
  for (const href of ["/markets", "/pricing", "/login", "/signup"]) {
    assert.match(header, new RegExp('href="' + href + '"'));
  }
});

test("market categories keep supported discovery functional and Futures inert", () => {
  const functional = marketCategories.filter(
    (category) => !("comingSoon" in category),
  );
  assert.deepEqual(
    functional.map((category) => category.title),
    ["U.S. Stocks", "ETFs", "Forex", "Crypto", "Commodities"],
  );
  assert.ok(functional.every((category) => "href" in category));
  const futures = marketCategories.find(
    (category) => category.title === "Futures",
  );
  assert.ok(futures);
  assert.equal("comingSoon" in futures && futures.comingSoon, true);
  assert.equal("href" in futures, false);
  assert.match(futures.description, /coming soon/i);
});

test("signup fields are interactive and launch-ready", () => {
  const markup = renderToStaticMarkup(
    createElement(SignupForm, {
      action: async () => ({}),
    }),
  );
  for (const field of [
    'name="name"',
    'name="email"',
    'name="password"',
    'name="confirm_password"',
    'name="terms"',
  ]) {
    assert.match(markup, new RegExp(field));
  }
  assert.doesNotMatch(markup, /\sdisabled(?:=|>|\s)/i);
  assert.doesNotMatch(markup, /early access|opening soon|available at launch/i);
  assert.match(markup, />Create account</);
});

test("signup validation requires matching secure fields and terms", () => {
  const form = new FormData();
  form.set("name", "Investor");
  form.set("email", "investor@example.com");
  form.set("password", "market-pass-2026");
  form.set("confirm_password", "market-pass-2026");
  form.set("terms", "on");
  assert.deepEqual(validateSignup(form), {
    data: {
      name: "Investor",
      email: "investor@example.com",
      password: "market-pass-2026",
    },
  });

  form.set("confirm_password", "different-pass");
  assert.match(validateSignup(form).error ?? "", /do not match/i);
  form.set("confirm_password", "market-pass-2026");
  form.delete("terms");
  assert.match(validateSignup(form).error ?? "", /terms/i);
});

test("active public marketing surfaces omit pre-launch copy", () => {
  const markup = [
    renderToStaticMarkup(createElement(Landing)),
    renderToStaticMarkup(createElement(Pricing)),
  ].join("");
  assert.doesNotMatch(
    markup,
    /early access|opening soon|available at launch|coming soon/i,
  );
});

test("admin allowlist grants only configured identities", () => {
  const configured = "owner@example.com, second@example.com";
  assert.equal(emailAllowed("OWNER@example.com", configured), true);
  assert.equal(emailAllowed("normal@example.com", configured), false);
  assert.equal(emailAllowed("owner@example.com", ""), false);
});

test("internal product navigation remains application-local", () => {
  const destinations = [
    ...accountDestinations(false).map((item) => item.href),
    ...marketCategories.flatMap((category) =>
      "href" in category ? [category.href] : [],
    ),
  ];
  assert.ok(destinations.every((href) => href.startsWith("/")));
  assert.ok(destinations.every((href) => !href.startsWith("//")));
});

test("pricing and primary market identity are localized for the United States", () => {
  assert.deepEqual(
    plans.map((plan) => plan.price),
    ["$0", "$9.99", "$19.99"],
  );
  assert.ok(plans.every((plan) => !plan.price.includes("₹")));
  assert.equal(marketCategories[0].title, "U.S. Stocks");
  assert.match(marketCategories[0].description, /NASDAQ|NYSE/);
  assert.equal(marketCategories[1].title, "ETFs");
});

test("admin presentation totals remain internally consistent", () => {
  assert.equal(adminTotalsAreConsistent(), true);
  assert.equal(
    adminSummary.freeUsers +
      adminSummary.plusSubscribers +
      adminSummary.proSubscribers,
    adminSummary.totalUsers,
  );
  assert.equal(
    adminSummary.plusSubscribers + adminSummary.proSubscribers,
    adminSummary.paidSubscribers,
  );
});

test("admin presentation records are deterministic and fictional", () => {
  const snapshot = JSON.stringify({
    adminSummary,
    adminUsers,
    subscriptionActivity,
    adminInsights,
    userGrowth,
    revenueTrend,
  });
  assert.equal(
    snapshot,
    JSON.stringify({
      adminSummary,
      adminUsers,
      subscriptionActivity,
      adminInsights,
      userGrowth,
      revenueTrend,
    }),
  );
  assert.equal(adminUsers.length, 10);
  assert.ok(adminUsers.every((user) => user.email.endsWith("@example.com")));
  const source = readFileSync(
    new URL("../lib/admin-demo.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /Math\.random/);
});

test("the required data disclosure is confined to the admin shell", () => {
  const adminShell = readFileSync(
    new URL("../components/admin-shell.tsx", import.meta.url),
    "utf8",
  );
  const normalMarkup = [
    renderToStaticMarkup(createElement(Landing)),
    renderToStaticMarkup(createElement(Pricing)),
    renderToStaticMarkup(
      createElement(SignupForm, { action: async () => ({}) }),
    ),
  ].join("");
  assert.equal((adminShell.match(/Demo data/g) ?? []).length, 1);
  assert.doesNotMatch(normalMarkup, /Demo data/i);
});

test("admin settings present U.S. market and USD defaults", () => {
  const source = readFileSync(
    new URL("../app/admin/settings/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /United States/);
  assert.match(source, /USD/);
});

test("account email presentation masks the local part", async () => {
  const { maskedEmail } = await import("../lib/format");
  assert.equal(maskedEmail("demo@tradexai.com"), "d•••@tradexai.com");
  assert.equal(maskedEmail("invalid"), "Signed-in account");
});
