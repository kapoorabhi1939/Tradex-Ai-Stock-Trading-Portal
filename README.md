# Tradex AI

A functional US-equities research and decision-support MVP built with Next.js, Supabase Auth, and Postgres. Market values are fictional demonstration data; accounts, saved watchlists, holdings, profiles, and alert records use Supabase.

**The repository root is the active application.** Run every command below from:

```text
C:\Users\epicg\Documents\Github\Tradex-Ai-Stock-Trading-Portal
```

The preserved `frontend/`, `backend/`, and `prototype/` directories are historical reference only. Their mock authentication, fallback data, Python services, and trading controls are not part of this application. Do not deploy them.

## Quick start

Requirements: Node.js 22 or newer and npm. This implementation was built with Node 24.18.0 and npm 11.16.0.

```powershell
npm ci
Copy-Item .env.example .env.local
# Edit .env.local privately using the two values saved from your Supabase project.
npm run dev
```

Open [the local app](http://127.0.0.1:3000). Without Supabase configuration, the landing page works and protected routes redirect to a setup-aware login page. Authentication is never simulated.

Do not overwrite an existing `.env.local` when copying the template. Never paste credentials into chat or commit environment files.

## Supabase setup — required before the full demo

1. In the existing project, obtain the project URL and **publishable key** from its Connect/API settings.
2. Set these two variables in the repository-root `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. In Supabase SQL Editor, run [the migration](supabase/migrations/202609100001_tradex_mvp.sql) **once**. It is transactional and creates six tables, checks, indexes, timestamps, ownership foreign keys, and RLS policies. It intentionally fails if conflicting tables already exist; inspect those tables instead of deleting them or disabling security.
4. In Authentication, enable email/password access and create a user through the dashboard. Set/confirm that user's email according to your project's configuration. Public signup and password-reset UI are not included in this MVP.
5. Set the Auth Site URL to your local app URL during development; change it to your deployed HTTPS URL for deployment. This MVP uses password sign-in, not OAuth or email callback flows.
6. Restart the Next.js server after setting environment variables, then sign in with that real Auth account.
7. Execute [the acceptance checklist](docs/ACCEPTANCE_CHECKLIST.md), including a second-user isolation check.

No service-role key or database password is used by the application. No credentials are included in `.env.example`. The publishable key is intentionally public, and RLS protects user-owned rows.

Alternatively, teams already using the Supabase CLI can apply the tracked migration through their established linked-project workflow. CLI account linking and remote migration execution were not performed in this implementation session.

## Commands

```powershell
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm start
npm run test:routes
```

`test:routes` requires a running server. It defaults to port 3000; set `TRADEX_BASE_URL` to test a different local or staging server. It deliberately sends unauthenticated requests.

The lockfile pins the installation used for validation. Next.js 16 uses a root `proxy.ts` and a standalone ESLint CLI; this project does not use `next lint`. The current framework also generated `AGENTS.md` / `CLAUDE.md` guidance.

## Architecture

| Location | Responsibility |
| --- | --- |
| `app/` | Public pages, protected route group, loading/error/not-found screens |
| `app/actions/` | Server-side authentication and validated database mutations |
| `components/` | Shared shell, forms, analytical panels, charts, feature views |
| `lib/supabase/` | Cookie-based SSR client and browser-client factory |
| `lib/auth.ts` | Verified server-side user identity |
| `lib/workspace.ts` | Request-scoped reads of the authenticated user's saved state |
| `lib/demo-market/` | Deterministic fictional market snapshot |
| `lib/signals/` | Explainable weighted-factor engine |
| `lib/portfolio/` | Value, allocation, concentration, and risk calculations |
| `lib/alerts/` | Manual snapshot rule evaluation |
| `lib/validation.ts` | Server-side inputs and safe login destinations |
| `supabase/migrations/` | Versioned Postgres schema and RLS |
| `tests/` | Pure calculations plus real SQL migration/RLS tests in PGlite |
| `scripts/smoke-routes.mjs` | Running-server public/protected route checks |

Next.js App Router and TypeScript handle the entire application. Tailwind CSS 4 and shared CSS/components establish the visual system. Lucide provides icons; Recharts provides interactive price and allocation charts. Native semantic forms cover the current controls without an additional UI package or global state library. There is no active Python backend.

## Routes

| Route | Access and behavior |
| --- | --- |
| `/` | Public landing and interactive demonstration chart |
| `/login` | Real email/password sign-in, configuration and error feedback |
| `/dashboard` | Protected overview, saved watchlist, selected chart, calculated signal, portfolio and alert summaries |
| `/research` | Protected search across company/ticker, sector filter and sorting |
| `/research/[ticker]` | Protected history, factors, sentiment, synthetic headlines, related symbols |
| `/portfolio` | Protected holding creation, editing/deletion, allocation and risk analysis |
| `/alerts` | Protected persistent rules, edit/enable/pause/delete, manual evaluation and history |
| `/settings` | Protected profile, account information, methodology and sign-out |

Unknown paths return a useful 404. Unsupported tickers return 404 after authentication. Legacy `/orders` and `/positions` are not exposed.

## Authentication and security

The SSR integration follows the [Supabase cookie/session pattern](https://supabase.com/docs/guides/auth/server-side/creating-a-client). The proxy refreshes/validates claims; protected layouts and every data mutation verify the current user with `auth.getUser()`. Successful sign-in persists cookies and redirects only to an allowlisted local application route. Passwords are sent directly to Supabase Auth from the server and are never saved by this app.

Every user-data table has RLS. Queries and mutations also filter by authenticated ownership. Composite foreign keys prevent attaching one user's watchlist item or triggered alert to another user's parent record. The public role has no table access. Trigger history is append-only for authenticated clients, with deletion cascading from its owning rule. Profile rows are created when a user first saves their display name; an email-based greeting works beforehand.

The app uses no service-role key, fake login, localStorage session, or silent database fallback. Server Actions enforce authentication, validation, and framework origin protections. Workspace responses are dynamic and private. Basic frame, content-type, referrer, and permissions headers are supplied.

Remaining security work includes deployed session-expiry/revocation checks, real-project two-user testing, rate limits/quotas, CSP deployment policy, monitoring, and abuse controls. The illustrative alert history is not intended as a tamper-proof financial audit log: users with their publishable client access can insert their own RLS-owned rows.

## Demonstration market dataset

`tradex-demo-2026-09-09-v1` is a fixed, fictional snapshot dated September 9, 2026. It supports AAPL, NVDA, MSFT, AMZN, TSLA, META, GOOGL, JPM, JNJ, XOM, PG, and CAT.

Each equity has 180 seeded weekday price observations, company/sector context, a quote, daily change, market-cap/volume-style values, seeded sentiment, and calculated annualized historical volatility. A ticker-specific deterministic generator produces repeatable history; the final close equals the shared current quote, and daily change is calculated from the preceding close. These weekdays are synthetic sessions, not an exchange-holiday calendar.

Chart periods display approximately 1/3/6 months using 20/60/120 observations. Changing a timeframe changes the chart slice; the baseline model consistently uses the shared full history. Headlines are explicitly synthetic scenarios, not current reporting. No paid or live market API is connected.

## Signal methodology

Weighted, clipped factors:
- Five-session momentum: 25%.
- Twenty-session momentum: 25%.
- Price relative to its 20-session moving average: 20%.
- Twenty-session vs. 60-session moving average: 20%.
- Seeded sentiment from -1 to +1: 10%.

Weighted score greater than 0.18 indicates bullish, below -0.18 bearish, and otherwise neutral. A bounded 0–100 confidence heuristic combines factor strength/agreement and a historical-volatility penalty. It is **not** a calibrated probability or ML prediction. Driver labels and explanations are calculated from those same factors. The horizon is an illustrative 5–20 sessions; generation time is the fixed dataset timestamp.

## Portfolio methodology

Current value = shares × shared demonstration quote. Cost basis = shares × average cost. Position and sector weights use current value; unrealized gain/loss uses the saved cost basis.

Concentration = sum of squared fractional position weights × 100 (HHI). Diversification = 100 minus the average of position and sector HHI. Risk combines position HHI (35%), sector HHI (35%), and capped weighted historical volatility (30%). Higher diversification is preferable; higher risk/concentration means greater modeled exposure. Empty portfolios display unavailable scores rather than presenting zero risk as a recommendation.

Flags identify single positions above 35%, sectors above 50%, heavy technology exposure, and weighted annualized volatility above 25%. Volatility is a weighted proxy, not a covariance-based portfolio estimate. No tax, brokerage, corporate action, currency, or execution model is supplied.

Holdings are unique per user/ticker. Fractional shares and nonnegative average cost are supported; edit the existing position to revise totals.

## Manual alerts

Rules cover price above/below, confidence above/below, and bullish/bearish signal state. Threshold comparisons are strict (`>` / `<`). Users create, edit conditions/thresholds, pause/resume, or delete rules and click **Evaluate demo alerts** to run them.

Evaluation uses the same quote and signal modules as research. Matches are persisted with a unique `(alert_rule_id, dataset_version)` constraint, and inserts ignore conflicts. This prevents duplicate history even across simultaneous evaluations. Repeated clicks, rule edits, and pause/resume do not manufacture changes in a fixed dataset. Signal rules record the initial matching state once per snapshot; continuous transition detection is future work. Deleting a rule also deletes its demo history, as stated in the confirmation.

There is no background monitoring, stream, email, or push delivery. The UI shows the latest 50 saved triggers.

## Validation and limitations

`npm test` runs 27 checks including real SQL execution in embedded PostgreSQL (PGlite). The tests simulate only `auth.uid()` and database roles, then apply the actual migration. They test ownership isolation, foreign-key injection, invalid values, persistent rows, and alert deduplication. This is not a substitute for a real Supabase Auth/PostgREST acceptance run.

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for commands actually run, browser evidence, known limitations, and configuration still needed. Screenshots captured locally are under `output/playwright/` and are intentionally ignored by Git.

## Deployment

Use a Node-capable Next.js host such as your existing deployment platform:
1. Deploy the **repository root**, not `frontend/`.
2. Install with `npm ci`, build with `npm run build`, and run `npm start` where a start command is needed.
3. Configure the two public Supabase variables before building. Public environment values are included at build time.
4. Apply the migration to the intended Supabase project and set its Auth Site URL to the deployed HTTPS origin.
5. Run the configured acceptance checklist and verify cookie refresh and ownership before a client demonstration.

Static export is not supported because authentication and persistence require server execution. No site was deployed or pushed during this run.

## Future production work

Real licensed market data; validated/covariance-aware risk analytics; model evaluation and calibration; persistent quote/version ingestion; transition-aware alert scheduling and delivery; account provisioning/reset/recovery; integration/E2E tests against staging Supabase; observability, rate limits, resource quotas, backups, and migration rollback planning.

No brokerage, trading, crypto, or autonomous-investing features are included.

## Git ownership

The verified remote is `git@github-tradex:kapoorabhi1939/Tradex-Ai-Stock-Trading-Portal.git`. Local author identity is `kapoorabhi1939 <kapoorabhi1939@gmail.com>`; SSH identified `kapoorabhi1939`.

Do not push until the application work is reviewed. Before any future push, repeat the repository-local identity, remote, and `ssh -T github-tradex` checks. GitHub's successful SSH test returns status 1 because shell access is not provided; inspect the authenticated account message. No global Git settings or history were changed.
