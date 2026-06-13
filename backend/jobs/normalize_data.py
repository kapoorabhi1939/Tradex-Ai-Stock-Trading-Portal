from __future__ import annotations

from datetime import datetime, timezone


REQUIRED_PRICE_FIELDS = {"ticker", "timestamp", "open", "high", "low", "close", "volume"}
REQUIRED_NEWS_FIELDS = {"ticker", "headline", "published_at"}


def normalize_price_rows(rows: list[dict]) -> list[dict]:
    normalized: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for row in rows:
        if not REQUIRED_PRICE_FIELDS.issubset(row):
            raise ValueError("Price row is missing required fields.")

        ticker = str(row["ticker"]).upper().strip()
        if not ticker:
            raise ValueError("Ticker is required.")

        timestamp = _parse_timestamp(row["timestamp"])
        if not _is_market_hours(timestamp):
            continue

        dedupe_key = (ticker, timestamp.isoformat())
        if dedupe_key in seen:
            continue
        seen.add(dedupe_key)

        normalized.append(
            {
                "ticker": ticker,
                "timestamp": timestamp.isoformat(),
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
                "volume": int(row["volume"]),
            }
        )

    return normalized


def normalize_news_rows(rows: list[dict]) -> list[dict]:
    normalized: list[dict] = []

    for row in rows:
        if not REQUIRED_NEWS_FIELDS.issubset(row):
            raise ValueError("News row is missing required fields.")

        ticker = str(row["ticker"]).upper().strip()
        headline = str(row["headline"]).strip()
        if not ticker or not headline:
            raise ValueError("Ticker and headline are required.")

        normalized.append(
            {
                "ticker": ticker,
                "headline": headline,
                "published_at": _parse_timestamp(row["published_at"]).isoformat(),
            }
        )

    return normalized


def _parse_timestamp(value: str | datetime) -> datetime:
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc)

    timestamp = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    return timestamp.astimezone(timezone.utc)


def _is_market_hours(timestamp: datetime) -> bool:
    weekday = timestamp.weekday()
    if weekday >= 5:
        return False

    minutes = (timestamp.hour * 60) + timestamp.minute
    market_open = (13 * 60) + 30
    market_close = 20 * 60
    return market_open <= minutes <= market_close

