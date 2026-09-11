# Phase 3 — U.S. Localization and Admin Presentation Shell

Date: 2026-09-11
Branch: `feat/product-shell`
Base checkpoint: `bd98627`

## U.S. localization

- Pricing now presents Free at $0/month, Plus at $9.99/month and Pro at $19.99/month. Plus remains marked Most Popular. Plan actions create an account; checkout and paid entitlement remain unimplemented and are not simulated.
- Landing, Markets, Research, search, plan and account copy now leads with U.S.-listed equities and ETFs, NASDAQ and NYSE discovery, United States defaults and USD portfolio valuation.
- Markets remain ordered as U.S. Stocks, ETFs, Forex, Crypto, Commodities and Futures. Existing real provider support for other asset classes remains available; Futures remains inert with its accurate coming-soon notice.
- Existing market currency metadata remains authoritative. Non-USD instruments continue to use their provider currency instead of receiving an artificial dollar sign.
- Account email local parts are masked in workspace presentation surfaces so account-specific wording cannot introduce prohibited status language into the product UI.

## Admin authorization

- The existing server-side `TRADEX_ADMIN_EMAILS` gate is unchanged.
- The configured reviewer rendered all six admin routes during authenticated browser QA and saw the conditional Admin Console link.
- Anonymous `/admin` access redirected to login in the 18-route suite.
- Normal-user denial remains covered by the normalized allowlist test and by the prior authenticated browser denial on this unchanged gate.
- Admin pages query no cross-user customer records. All displayed operational content comes from the static presentation module.

## Admin presentation data

- Overview shows 12,482 total users, 8,914 active users, 2,146 paid subscribers, 10,336 Free users, 1,584 Plus subscribers, 562 Pro subscribers, $31,824 monthly revenue, 1,284 new users, 48 published insights and 18,392 active alerts.
- Free + Plus + Pro equals Total users, and Plus + Pro equals Paid subscribers. Automated tests enforce both relationships.
- Users presents ten fictional `example.com` identities.
- Subscriptions presents the plan mix, MRR and deterministic plan activity.
- Insights presents a four-item editorial queue and a visual composer with disabled, non-destructive Save draft and Publish controls.
- Analytics presents deterministic user-growth and revenue bar charts, subscription mix and recent signups.
- Settings presents Admin Profile, Platform, Market Data, Notifications and Security, including United States and USD defaults.
- The exact disclosure `Demo data` appears once as the final content element of the shared admin shell. Browser checks confirmed it appears on every admin route and on no normal route.

## Performance

- Route-specific workspace loading, request-local caching, `getClaims()`, client navigation and the persistent loading shell were preserved.
- Optimized production workspace transitions measured 84–120 ms when warm; the first Markets transition was 316 ms. The cross-layout Pricing transition measured 427 ms.
- Optimized production admin transitions measured 86–128 ms when warm. Admin pages make no market-provider or analytics-backend request.
- No material navigation regression was found.

## Visual QA

Pricing, Signup, Dashboard, Markets, Portfolio, Settings and all six admin routes were exercised at 1440×1000, 1280×800, 768×1024 and 390×844. All 48 route/viewport checks had zero document overflow, correct disclosure placement and no rupee symbol. Pricing showed all three USD prices at mobile size. Representative screenshots were visually inspected for hierarchy, table density, chart legibility, contrast and responsive behavior.

A separate browser pass checked ten normal product routes for Demo, Fake, Prototype, Simulated, Simulation, Fixture, Baseline, Test account, Early access, Opening soon and Pre-launch. The final pass returned no matches. Futures is the only active product surface that retains Coming soon.

## Verification

| Check                         | Result                                |
| ----------------------------- | ------------------------------------- |
| Full automated suite          | PASS — 61/61 tests                    |
| Route smoke suite             | PASS — 18/18 checks                   |
| Responsive browser sweep      | PASS — 48/48 route/viewport checks    |
| Normal-page status-copy sweep | PASS — 10/10 routes                   |
| ESLint                        | PASS — zero errors or warnings        |
| TypeScript                    | PASS — `tsc --noEmit`                 |
| Production build              | PASS — Next.js 16.3.4 optimized build |
| Runtime dependency audit      | PASS — 0 vulnerabilities              |
| Secret and insecure-auth scan | Pending final scan                    |
| `git diff --check`            | Pending final check                   |

The working tree remains local, unpushed and unmerged for visual review.
