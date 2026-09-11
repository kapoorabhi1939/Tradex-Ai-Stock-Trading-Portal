# Tradex AI

Tradex is a dark-first market research and portfolio workspace built with Next.js, Supabase Auth/Postgres and server-side Twelve Data. The repository root is the active application. Historical frontend/backend/prototype directories are reference only.

## Local development

Use Node.js 22+ and npm from the repository root.

1. Run npm ci.
2. Create .env.local privately from the blank .env.example without overwriting an existing file.
3. Configure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and **TWELVE_DATA_API_KEY**.
4. Obtain the market key from your [Twelve Data dashboard](https://twelvedata.com/account/api-keys). Never use a NEXT_PUBLIC prefix for it.
5. Apply supabase/migrations/202609100001_tradex_mvp.sql once to your intended Supabase project and provision a confirmed email/password account. Existing configured projects need no new migration for Phase 1.
6. Run npm run dev and open http://127.0.0.1:3000.

Account provisioning/signup/recovery remains a later phase. No login bypass is supplied.

## Commands

- npm run dev — local server
- npm run lint — application ESLint
- npm run typecheck — TypeScript
- npm test — original engine/database tests plus mocked provider/cache/live-analytics tests; no live provider calls
- npm run build — production compilation
- npm start — serve the production build
- npm run test:routes — unauthenticated smoke checks against an already running local server (TRADEX_BASE_URL overrides port 3000)
- npm audit --omit=dev — runtime dependency audit

## Market-data architecture

All provider access goes through lib/market-data/provider.ts and its server-only Twelve Data adapter. UI and business logic receive normalized instruments, quotes and chronological OHLC candles; raw provider responses and credentials never enter client props.

| Module | Responsibility |
| --- | --- |
| types.ts | Provider-neutral instruments, quotes, candles and result freshness |
| normalizers.ts | Defensive parsing, symbol validation, asset classification |
| transport.ts | Timeout, authorization header and sanitized HTTP/provider errors |
| twelve-data.ts | Server-only adapter, quote batching, rate guard and disk cache integration |
| cache.ts | Central freshness policy, single-flight loading, stale fallback and failure backoff |
| analytics.ts | Price-derived signal, partial portfolio valuation and price/signal rule evaluation |
| saved-symbols.ts | Existing persistence eligibility; separate from global discovery |

Actual application endpoints:
- /quote: latest quote, OHLC/day movement, currency/exchange and market state when supplied. Latest price comes from this response, avoiding a redundant /price call.
- /time_series: 260 daily candles, ascending order. The client slices these into 1M, 3M, 6M and 1Y ranges without new provider calls.
- /symbol_search: provider-discovered instruments beyond the original fixed list. Accessible through an authenticated local /api/market/search route.

Quote metadata and search supply instrument information when available. Unknown fields are omitted. No paid fundamentals or fictional news/sentiment is displayed. Actual futures contracts are not claimed; the type model supports a future provider adapter. Exchange-reference pages alone are not evidence of available futures-contract data.

### Cache and request policy

| Data | Fresh TTL | Reason |
| --- | --- | --- |
| Quotes / supplied market state | 60 seconds | Conservative navigation freshness on a limited development plan |
| Symbol search / search metadata | 10 minutes | Identical discovery queries rarely change |
| Daily history | 1 hour | Reuse across charts and signals; no intraday polling |
| Stale real values | At most 24 hours from retrieval | Keep last successful data through a transient outage, visibly marked |
| Failed requests | 60 seconds | Avoid repeated requests during quota/outage recovery |

Successful normalized public market responses are stored in ignored .cache/tradex-market files and a bounded 500-entry process cache. User data, tokens and API keys are never stored there. A 20ms quote collector batches unique pending symbols; concurrent consumers share promises. Batches still cost one credit per symbol. The process guard limits market usage to seven credits per rolling minute and 750/day, leaving margin under the observed Basic plan (eight/minute). No polling or automatic retry loop runs.

Search waits 450ms after typing, requires two characters, cancels superseded browser requests, handles empty/errors, supports arrow keys/Enter/Escape and closes on outside pointer events. Browser cancellation does not cancel an already-running shared provider request.

**Deployment limitation:** the local disk cache is suitable for this development/staging process. Read-only hosts fall back to memory. Rate counters and in-flight deduplication are process-local; a multi-instance public deployment needs a shared cache/quota coordinator and provider-appropriate licensing. No commercial deployment is included in Phase 1.

## Product routes

- / — public product landing, no fabricated market preview
- /login — real cookie-based sign-in
- /dashboard?symbol=... — coherent URL-selected Market Lens, watchlist, portfolio and recent activity
- /research — provider-backed discovery
- /research/[ticker] — safely encoded dynamic instrument research, including qualified symbols and currency pairs
- /portfolio — saved holdings and real/cached USD valuation
- /alerts — manual price/signal evaluation, editing, pause/resume and history
- /settings — profile and account information

Only label timestamps/market state supplied by the provider. The UI does not advertise all quotes as real-time. Daily bars may include the current session; their dates and observation ranges are visible.

## Signals and calculations

Tradex Signal uses daily closes: five-session momentum (30%), twenty-session momentum (30%), price relative to its twenty-session average (20%), and twenty-vs-sixty-session average trend (20%). Factors are clipped to [-1,1]; weighted scores above 0.18 are bullish and below -0.18 bearish. Strength/agreement and annualized log-return volatility (252-session convention) produce a bounded 0–100 factor score. At least sixty observations are required. There is no sentiment input or probability-of-profit claim.

Saved acquisition costs remain unchanged. Current position value equals quantity times a valid USD quote. Missing or non-USD quotes leave that position unavailable; known market value is explicitly partial and full gain/loss is withheld. No missing quote becomes a zero-priced asset. Position allocation/concentration uses available values; sector/volatility risk estimates are withheld without verified inputs.

Manual alerts use fresh cached quotes and real-price technical signals. Stale/unavailable inputs are skipped. The existing unique (alert_rule_id,dataset_version) constraint is reused with a provider trading-day key, limiting each rule to one record per day. Editing or pause/resume cannot re-arm that day. Existing history remains stored; older demonstration evaluations are shown as archived records, not current market facts. Deleting a rule still cascades its own history.

## Persistence and security boundaries

The existing migration, numeric checks, ownership policies, composite foreign keys and server action authentication remain intact. Phase 1 intentionally preserves the database's 12-symbol persistence constraint for watchlists, USD holdings and alerts: AAPL, NVDA, MSFT, AMZN, TSLA, META, GOOGL, JPM, JNJ, XOM, PG and CAT. Research/search is independent and not restricted to these symbols. Other instruments are research-only; foreign listings cannot be saved as their USD counterparts. Generalizing saved instruments requires a reviewed instrument-identity/currency migration in a later phase.

All mutations verify the current Supabase user and restrict ownership. No service-role key is required. Market keys use a server-side Authorization header, never browser query strings, localStorage or public environment variables. Provider failures return sanitized product messages; missing market configuration names TWELVE_DATA_API_KEY only in server development diagnostics.

Private environment files, browser profiles/storage state, screenshots, logs and build output are ignored. Never include them in a commit.

## Checkpoints and limits

Verified baseline: e004336c84a223f9eb6670182f5a36cb3f97eb70, pushed before Phase 1.
Phase 1 branch: feat/premium-live-market-data. Do not commit, push or merge without explicit review approval.

The original 27 tests and deterministic fixture modules remain as baseline regression coverage. Active application components do not import the fictional market data. New provider tests use mock responses, never a real key or live API calls. See docs/PHASE1_REPORT.md for actual live/browser results; the earlier IMPLEMENTATION_STATUS.md records the baseline only.

A second real account with existing remote rows, session-expiry/revocation, commercial licensing, multi-instance quota coordination, public signup/recovery, billing, admin, notifications, continuous workers and live news remain outside this phase. Do not infer live two-account acceptance from the local SQL isolation suite.

## Provider references

[Authentication and error handling](https://twelvedata.com/docs/introduction/quickstart), [request batching](https://support.twelvedata.com/en/articles/5620512-how-to-create-a-request), [credit monitoring](https://support.twelvedata.com/en/articles/5713553-control-over-api-usage), [plan capabilities](https://twelvedata.com/pricing).
