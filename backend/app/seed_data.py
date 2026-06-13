from __future__ import annotations

from datetime import datetime, timedelta, timezone
import hashlib
import math

from .models import AlertRule, OrderType, PortfolioHolding, PriceBar, TradeTick, UserProfile


ANCHOR_TIME = datetime(2026, 6, 8, 14, 30, tzinfo=timezone.utc)


SYMBOLS = {
    "AAPL": {
        "company_name": "Apple Inc.",
        "sector": "Technology",
        "description": "Consumer hardware leader with recurring services revenue and resilient cash generation.",
    },
    "MSFT": {
        "company_name": "Microsoft Corporation",
        "sector": "Technology",
        "description": "Cloud and productivity platform with strong enterprise momentum.",
    },
    "NVDA": {
        "company_name": "NVIDIA Corporation",
        "sector": "Technology",
        "description": "AI infrastructure provider benefiting from accelerated compute demand.",
    },
    "AMZN": {
        "company_name": "Amazon.com, Inc.",
        "sector": "Consumer Discretionary",
        "description": "E-commerce and cloud platform balancing retail scale with AWS profitability.",
    },
    "JPM": {
        "company_name": "JPMorgan Chase & Co.",
        "sector": "Financials",
        "description": "Diversified bank with strong capital position and broad market exposure.",
    },
    "XOM": {
        "company_name": "Exxon Mobil Corporation",
        "sector": "Energy",
        "description": "Integrated energy producer with cyclical commodity exposure and strong dividends.",
    },
}


NEWS_BY_TICKER = {
    "AAPL": [
        "Apple expands services margin while iPhone demand remains resilient.",
        "Analysts note positive upgrade cycle tied to enterprise device refresh.",
        "Supply chain normalization eases near-term shipment risk.",
    ],
    "MSFT": [
        "Microsoft cloud bookings accelerate as enterprise AI pilots convert into contracts.",
        "Azure momentum offsets softer personal computing demand.",
        "New security bundle wins support from CIOs after strong product reviews.",
    ],
    "NVDA": [
        "NVIDIA posts strong data-center demand and upbeat guidance for AI infrastructure.",
        "Investors remain optimistic despite elevated valuation concerns.",
        "Chip export headlines create some volatility, but commercial demand stays strong.",
    ],
    "AMZN": [
        "Amazon retail efficiency improves while AWS optimization headwinds continue to fade.",
        "Ad business shows strong momentum heading into the next quarter.",
        "Delivery investments raise some cost concerns despite healthy cash flow.",
    ],
    "JPM": [
        "JPMorgan benefits from stable credit quality and disciplined balance-sheet management.",
        "Net interest income outlook cools slightly as rate expectations shift.",
        "Banking fees recover as corporate activity picks up.",
    ],
    "XOM": [
        "Exxon cash flow remains supported by disciplined capital spending.",
        "Oil price volatility pressures short-term sentiment across energy equities.",
        "Dividend stability keeps long-term income investors engaged.",
    ],
}


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def generate_price_bars(ticker: str, start_price: float, trend_step: float, amplitude: float) -> list[PriceBar]:
    bars: list[PriceBar] = []
    price = start_price

    for index in range(40):
        timestamp = ANCHOR_TIME - timedelta(minutes=39 - index)
        wave = math.sin(index / 2.5) * amplitude
        drift = trend_step * index
        baseline = start_price + drift + wave
        open_price = round(price, 2)
        close_price = round(max(5.0, baseline), 2)
        high_price = round(max(open_price, close_price) + 0.8, 2)
        low_price = round(min(open_price, close_price) - 0.7, 2)
        volume = int(900_000 + (index * 12_500) + abs(wave) * 45_000)

        bars.append(
            PriceBar(
                ticker=ticker,
                timestamp=timestamp,
                open=open_price,
                high=high_price,
                low=low_price,
                close=close_price,
                volume=volume,
            )
        )
        price = close_price

    return bars


PRICE_BARS = {
    "AAPL": generate_price_bars("AAPL", 192.4, 0.18, 1.7),
    "MSFT": generate_price_bars("MSFT", 421.5, 0.22, 2.1),
    "NVDA": generate_price_bars("NVDA", 118.3, 0.31, 3.2),
    "AMZN": generate_price_bars("AMZN", 181.0, 0.14, 2.0),
    "JPM": generate_price_bars("JPM", 203.7, 0.07, 1.2),
    "XOM": generate_price_bars("XOM", 114.2, -0.03, 1.8),
}


LATEST_VOLUME_24H = {
    "AAPL": 1_234_567.00,
    "MSFT": 935_440.00,
    "NVDA": 2_804_218.00,
    "AMZN": 801_560.00,
    "JPM": 390_450.00,
    "XOM": 475_210.00,
}


def _trade_ticks_for(ticker: str, anchor_price: float) -> list[TradeTick]:
    ticks: list[TradeTick] = []
    for offset, (price_shift, size, side) in enumerate(
        [
            (0.00, 12, "buy"),
            (0.05, 25, "buy"),
            (-0.03, 18, "sell"),
            (0.08, 9, "buy"),
            (-0.02, 40, "sell"),
        ]
    ):
        ticks.append(
            TradeTick(
                price=round(anchor_price + price_shift, 2),
                size=size,
                timestamp=ANCHOR_TIME - timedelta(seconds=offset * 11),
                side=side,
            )
        )
    return ticks


TRADE_TICKS = {
    ticker: _trade_ticks_for(ticker, bars[-1].close) for ticker, bars in PRICE_BARS.items()
}


DEFAULT_ORDER_TYPES: list[OrderType] = ["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]


DEMO_USER = UserProfile(
    user_id="user-1",
    full_name="Demo Investor",
    email="demo@tradex.ai",
    password_hash=_hash_password("demo1234"),
    created_at=ANCHOR_TIME,
)


DEFAULT_WATCHLIST = {
    "user-1": ["AAPL", "MSFT", "NVDA"],
}


DEFAULT_ALERTS = {
    "user-1": [
        AlertRule(
            alert_id="alert-1",
            ticker="NVDA",
            condition_type="price_above",
            threshold=130.0,
            delivery_channel="email",
            enabled=True,
            created_at=ANCHOR_TIME,
        ),
        AlertRule(
            alert_id="alert-2",
            ticker="AAPL",
            condition_type="signal_change",
            threshold=0.0,
            delivery_channel="in_app",
            enabled=True,
            created_at=ANCHOR_TIME,
        ),
    ]
}


DEFAULT_HOLDINGS = {
    "user-1": [
        PortfolioHolding(ticker="AAPL", shares=150, average_cost=127.3450),
        PortfolioHolding(ticker="MSFT", shares=48, average_cost=402.1000),
        PortfolioHolding(ticker="NVDA", shares=90, average_cost=118.2000),
        PortfolioHolding(ticker="JPM", shares=70, average_cost=197.4200),
    ]
}


DEFAULT_ACCOUNT_STATE = {
    "user-1": {
        "cash_available": 50_000.00,
        "margin_level_pct": 145.2,
        "drawdown_used_pct": 36.5,
        "leverage_tier": "retail",
        "kyc_status": "verified",
        "trading_restricted": False,
        "restriction_scope": "none",
        "banner_level": "info",
        "banner_text": "Account verified. No active jurisdiction restrictions are blocking trades.",
        "ytd_return_pct": 12.4,
    }
}


DEFAULT_ORDERS = {
    "user-1": [
        {
            "order_id": "ord-1001",
            "ticker": "NVDA",
            "order_type": "LIMIT",
            "status": "PARTIAL",
            "filled_quantity": 25.0,
            "total_quantity": 50.0,
            "limit_price": 127.50,
            "needs_reconcile": True,
        },
        {
            "order_id": "ord-1002",
            "ticker": "AAPL",
            "order_type": "MARKET",
            "status": "FILLED",
            "filled_quantity": 20.0,
            "total_quantity": 20.0,
            "limit_price": None,
            "needs_reconcile": False,
        },
        {
            "order_id": "ord-1003",
            "ticker": "MSFT",
            "order_type": "STOP_LIMIT",
            "status": "PENDING",
            "filled_quantity": 0.0,
            "total_quantity": 12.0,
            "limit_price": 426.25,
            "needs_reconcile": False,
        },
    ]
}


DEFAULT_INSTRUMENT_META = {
    "AAPL": {"leverage": 3.0, "restricted": False, "restriction_reason": "", "kyc_required": False},
    "MSFT": {"leverage": 3.5, "restricted": False, "restriction_reason": "", "kyc_required": False},
    "NVDA": {"leverage": 5.0, "restricted": False, "restriction_reason": "", "kyc_required": False},
    "AMZN": {"leverage": 2.5, "restricted": False, "restriction_reason": "", "kyc_required": False},
    "JPM": {"leverage": 2.0, "restricted": False, "restriction_reason": "", "kyc_required": False},
    "XOM": {
        "leverage": 1.0,
        "restricted": True,
        "restriction_reason": "Restricted for this demo jurisdiction during extended-hours routing.",
        "kyc_required": True,
    },
}
