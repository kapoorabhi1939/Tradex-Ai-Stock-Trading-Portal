from __future__ import annotations

from collections import Counter

from ..models import SentimentResult
from ..seed_data import ANCHOR_TIME


POSITIVE_WORDS = {
    "accelerate",
    "accelerated",
    "benefits",
    "disciplined",
    "expand",
    "expands",
    "healthy",
    "improves",
    "momentum",
    "optimistic",
    "positive",
    "profitability",
    "resilient",
    "strong",
    "support",
    "upbeat",
    "wins",
}

NEGATIVE_WORDS = {
    "concerns",
    "cools",
    "cost",
    "fade",
    "headwinds",
    "pressures",
    "risk",
    "softer",
    "volatility",
}


class SentimentEngine:
    def score(self, ticker: str, headlines: list[str]) -> SentimentResult:
        if not headlines:
            return SentimentResult(
                ticker=ticker,
                score=0.0,
                label="neutral",
                headline_count=0,
                summary="No fresh headlines were available, so sentiment is neutral by default.",
                generated_at=ANCHOR_TIME,
            )

        word_counts: Counter[str] = Counter()
        positive_hits = 0
        negative_hits = 0

        for headline in headlines:
            tokens = {token.strip(".,").lower() for token in headline.split()}
            word_counts.update(tokens)
            positive_hits += sum(1 for token in tokens if token in POSITIVE_WORDS)
            negative_hits += sum(1 for token in tokens if token in NEGATIVE_WORDS)

        raw_score = (positive_hits - negative_hits) / max(len(headlines) * 3, 1)
        score = max(-1.0, min(1.0, round(raw_score, 2)))

        if score > 0.2:
            label = "positive"
        elif score < -0.2:
            label = "negative"
        else:
            label = "neutral"

        dominant_terms = ", ".join(word for word, _ in word_counts.most_common(3))
        summary = (
            f"Scanned {len(headlines)} recent headlines. Tone is {label} with recurring themes around "
            f"{dominant_terms}."
        )

        return SentimentResult(
            ticker=ticker,
            score=score,
            label=label,
            headline_count=len(headlines),
            summary=summary,
            generated_at=ANCHOR_TIME,
        )

