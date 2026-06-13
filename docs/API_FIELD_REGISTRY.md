# API Field Registry

This document is the in-repo implementation companion to `1780693227061_data.xlsx`. It captures the UI fields from the workbook and where they are implemented in the current demo portal.

## Account and Dashboard

| UI Field | Endpoint | Implemented In |
| --- | --- | --- |
| Total Portfolio Value | `GET /v1/account/summary` | Dashboard top summary bar |
| Day Change (%) | `GET /v1/account/summary` | Dashboard top summary bar |
| Cash Available ($) | `GET /v1/account/summary` and `GET /v1/account/balance` | Dashboard top summary bar |
| Margin Level (%) | `GET /v1/account/risk` | Dashboard alerts and positions overview |
| YTD Return (%) | `GET /v1/account/performance?range=YTD` | Dashboard top summary bar |
| Trading Restrictions Flag | `GET /v1/account/flags` and `GET /v1/instruments/{symbol}/restrictions` | Compliance banner and symbol/order restrictions |

## Portfolio and Positions

| UI Field | Endpoint | Implemented In |
| --- | --- | --- |
| Instrument Ticker | `GET /v1/portfolio/positions` | Positions table, dashboard positions preview |
| Position Size (Qty) | `GET /v1/portfolio/positions` | Positions table, dashboard positions preview |
| Avg Entry Price | `GET /v1/portfolio/positions` | Positions table, dashboard positions preview |
| Mark Price | `GET /v1/market/quote?symbol={ticker}` and `GET /v1/portfolio/positions` | Positions table, symbol page, dashboard |
| Unrealized P&L ($) | Derived on backend position snapshot | Positions table, dashboard positions preview |
| Leverage | `GET /v1/instruments/{symbol}/meta` and `GET /v1/portfolio/positions` | Positions table, symbol page, dashboard |
| Last Trade Time | `GET /v1/market/stats?symbol={ticker}` and `GET /v1/portfolio/positions` | Symbol page, positions table, dashboard |

## Orders

| UI Field | Endpoint | Implemented In |
| --- | --- | --- |
| Order Type | `GET /config/order_types` | Orders page order-entry widget |
| Limit Price | User input plus `GET /v1/market/quote?symbol={ticker}` | Orders page order-entry widget |
| Estimated Fees ($) | `POST /v1/orders/estimate` | Orders page estimate panel |
| Order Status | `GET /v1/orders?limit=50` | Orders page lifecycle table, dashboard order preview |
| Filled Quantity | `GET /v1/orders?limit=50` and `GET /v1/orders/{orderId}/fills` | Orders page lifecycle table |

## Market Data

| UI Field | Endpoint | Implemented In |
| --- | --- | --- |
| Top 5 Bids/Asks | `GET /v1/market/depth?symbol={ticker}` | Dashboard order book panel |
| Latest Ticks | `GET /v1/market/trades?symbol={ticker}` | Dashboard time-and-sales panel |
| 24h Volume | `GET /v1/market/stats?symbol={ticker}` | Dashboard market snapshot, symbol page |

## Staleness and Edge Cases

- Freshness metadata is returned alongside account, quote, order, trade, depth, and position payloads.
- Margin bands are implemented as `safe`, `warning`, and `margin_call`.
- Order lifecycle colors are implemented for `DRAFT`, `PENDING`, `SUBMITTED`, `PARTIAL`, `FILLED`, `CANCELLED`, `REJECTED`, and `EXPIRED`.
- Instrument restrictions and KYC-related messaging are exposed in symbol and order workflows.
- The current demo uses seeded in-memory data and deterministic timestamps rather than live exchange feeds.
