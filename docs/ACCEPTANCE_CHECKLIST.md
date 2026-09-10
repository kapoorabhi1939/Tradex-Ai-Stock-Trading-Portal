# Tradex AI — configured acceptance journey

Local code and SQL tests cannot establish that a remote Supabase project is correctly configured. Run this checklist with a real Auth account after the root README setup. Never paste passwords or session tokens into a bug report.

## Account and navigation

- Open `/`, use Sign in, and try invalid credentials: a useful error must appear.
- Sign in using the Supabase Auth account. Confirm `/dashboard` loads.
- Refresh the dashboard; confirm the session and email persist.
- Open `/research`, search `Apple` and `AAPL`, filter by sector, and change sorting.
- Open `/research/NVDA`, change 1M / 3M / 6M, and inspect chart tooltips.
- Compare the ticker's displayed quote and calculated confidence across dashboard, directory, detail, and alerts.
- While authenticated, visit `/research/INVALID`; confirm the not-found experience.

## Saved state

- Add AAPL to the watchlist, refresh, remove it, and refresh again.
- Add AAPL, MSFT, and NVDA holdings with shares and average costs. Check that a technology concentration warning appears.
- Edit shares and cost; confirm total value, position weight, and unrealized gain/loss update.
- Refresh, sign out/in, and confirm holdings persist.
- Add holdings in other sectors and observe diversification and risk changing.
- Delete one holding, cancel another deletion, and confirm the expected saved state.
- Change display name in Settings. Refresh Dashboard and confirm the greeting.

## Alerts

- Create AAPL price above 200. Refresh; confirm the rule remains saved.
- Create examples of all six supported rule types. Confidence thresholds must stay within 0–100.
- Evaluate demo alerts; AAPL price above 200 should match the fixed $228.64 snapshot.
- Evaluate again immediately and after a minute. No duplicate trigger for the same rule/snapshot should appear.
- Pause a rule and evaluate; it must be excluded. Resume and evaluate; existing snapshot history stays deduplicated.
- Delete a rule after accepting confirmation. Only its associated history is removed.

## Security and browser behavior

- With two different real Supabase users, repeat saved-state steps and confirm no account sees the other's data.
- Sign out, then visit all protected paths directly and through browser Back. Refresh must require authentication.
- Test session refresh after token expiry and confirm revoked/invalid sessions fail closed.
- Test desktop, tablet, and narrow mobile sizes. Open/close the mobile navigation; tables should scroll inside their panels.
- Use keyboard navigation, visible focus, form labels, and chart timeframe controls.
- Disconnect the network during a save and verify that the app does not claim success.

Real Supabase authentication, refresh, watchlist and holding CRUD, alert CRUD/evaluation/deduplication, profile persistence, sign-out route protection and fresh sign-in were executed on September 10, 2026. This checklist includes broader hardening scenarios that are not all complete. See IMPLEMENTATION_STATUS.md for exact results and unverified cases.
