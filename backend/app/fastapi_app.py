from __future__ import annotations

from urllib.parse import urlencode

try:
    from fastapi import FastAPI, Header, HTTPException, Query
    from fastapi.middleware.cors import CORSMiddleware
except Exception:  # pragma: no cover - optional dependency adapter
    FastAPI = None  # type: ignore[assignment]

from .routes import Application


app = None

if FastAPI is not None:
    application = Application()
    app = FastAPI(title="Tradex AI API", version="0.2.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/auth/signup", status_code=201)
    def signup(payload: dict):
        return _forward("POST", "/auth/signup", body=payload)

    @app.post("/auth/login")
    def login(payload: dict):
        return _forward("POST", "/auth/login", body=payload)

    @app.get("/watchlist")
    def get_watchlist(authorization: str | None = Header(default=None)):
        return _forward("GET", "/watchlist", authorization=authorization)

    @app.post("/watchlist/items", status_code=201)
    def create_watchlist_item(payload: dict, authorization: str | None = Header(default=None)):
        return _forward("POST", "/watchlist/items", body=payload, authorization=authorization)

    @app.post("/portfolio/analyze")
    def analyze_portfolio(payload: dict):
        return _forward("POST", "/portfolio/analyze", body=payload)

    @app.get("/alerts")
    def get_alerts(authorization: str | None = Header(default=None)):
        return _forward("GET", "/alerts", authorization=authorization)

    @app.post("/alerts", status_code=201)
    def create_alert(payload: dict, authorization: str | None = Header(default=None)):
        return _forward("POST", "/alerts", body=payload, authorization=authorization)

    @app.get("/v1/account/summary")
    def account_summary(authorization: str | None = Header(default=None)):
        return _forward("GET", "/v1/account/summary", authorization=authorization)

    @app.get("/v1/account/balance")
    def account_balance(authorization: str | None = Header(default=None)):
        return _forward("GET", "/v1/account/balance", authorization=authorization)

    @app.get("/v1/account/risk")
    def account_risk(authorization: str | None = Header(default=None)):
        return _forward("GET", "/v1/account/risk", authorization=authorization)

    @app.get("/v1/account/flags")
    def account_flags(authorization: str | None = Header(default=None)):
        return _forward("GET", "/v1/account/flags", authorization=authorization)

    @app.get("/v1/account/performance")
    def account_performance(range: str = Query(default="YTD"), authorization: str | None = Header(default=None)):
        return _forward("GET", "/v1/account/performance", query={"range": range}, authorization=authorization)

    @app.get("/v1/portfolio/positions")
    def portfolio_positions(authorization: str | None = Header(default=None)):
        return _forward("GET", "/v1/portfolio/positions", authorization=authorization)

    @app.get("/v1/orders")
    def orders(authorization: str | None = Header(default=None), accountId: str | None = Query(default=None), limit: int = Query(default=50)):
        query = {"limit": limit}
        if accountId:
            query["accountId"] = accountId
        return _forward("GET", "/v1/orders", query=query, authorization=authorization)

    @app.post("/v1/orders/estimate")
    def order_estimate(payload: dict):
        return _forward("POST", "/v1/orders/estimate", body=payload)

    @app.get("/v1/orders/{order_id}/fills")
    def order_fills(order_id: str, authorization: str | None = Header(default=None)):
        return _forward("GET", f"/v1/orders/{order_id}/fills", authorization=authorization)

    @app.get("/config/order_types")
    def order_types():
        return _forward("GET", "/config/order_types")

    @app.get("/v1/market/quote")
    def market_quote(symbol: str):
        return _forward("GET", "/v1/market/quote", query={"symbol": symbol})

    @app.get("/v1/market/depth")
    def market_depth(symbol: str):
        return _forward("GET", "/v1/market/depth", query={"symbol": symbol})

    @app.get("/v1/market/stats")
    def market_stats(symbol: str):
        return _forward("GET", "/v1/market/stats", query={"symbol": symbol})

    @app.get("/v1/market/trades")
    def market_trades(symbol: str):
        return _forward("GET", "/v1/market/trades", query={"symbol": symbol})

    @app.get("/v1/instruments/{ticker}/meta")
    def instrument_meta(ticker: str):
        return _forward("GET", f"/v1/instruments/{ticker}/meta")

    @app.get("/v1/instruments/{ticker}/restrictions")
    def instrument_restrictions(ticker: str):
        return _forward("GET", f"/v1/instruments/{ticker}/restrictions")

    @app.get("/symbols/{ticker}/overview")
    def symbol_overview(ticker: str):
        return _forward("GET", f"/symbols/{ticker}/overview")

    @app.get("/symbols/{ticker}/signal")
    def symbol_signal(ticker: str):
        return _forward("GET", f"/symbols/{ticker}/signal")

    @app.get("/symbols/{ticker}/sentiment")
    def symbol_sentiment(ticker: str):
        return _forward("GET", f"/symbols/{ticker}/sentiment")


def _forward(
    method: str,
    path: str,
    *,
    body: dict | None = None,
    query: dict | None = None,
    authorization: str | None = None,
):
    response = application.route_request(
        method,
        path,
        query_string=urlencode(query or {}),
        body=_encode(body) if body is not None else None,
        headers={"authorization": authorization or ""},
    )
    return _unwrap(response)


def _encode(payload: dict) -> bytes:
    import json

    return json.dumps(payload).encode("utf-8")


def _unwrap(response):
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail=response.payload)
    return response.payload
