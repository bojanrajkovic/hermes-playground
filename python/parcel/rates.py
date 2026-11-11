"""Carrier rate tables loaded from config/carriers.json."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

DEFAULT_PATH = Path(__file__).resolve().parents[2] / "config" / "carriers.json"


@dataclass(frozen=True)
class Rate:
    carrier: str
    base_cents: int
    per_kg_cents: int
    max_kg: float

    def price_cents(self, weight_kg: float) -> int:
        if weight_kg > self.max_kg:
            raise ValueError(f"{self.carrier} does not carry parcels over {self.max_kg} kg")
        return round(self.base_cents + weight_kg * self.per_kg_cents)


def load_rates(path: Path = DEFAULT_PATH) -> list[Rate]:
    with path.open() as handle:
        raw = json.load(handle)
    return [
        Rate(
            carrier=entry["id"],
            base_cents=entry["baseCents"],
            per_kg_cents=entry["perKgCents"],
            max_kg=entry["maxKg"],
        )
        for entry in raw["carriers"]
    ]


def cheapest(rates: list[Rate], weight_kg: float) -> Rate:
    eligible = [rate for rate in rates if weight_kg <= rate.max_kg]
    if not eligible:
        raise ValueError(f"no carrier accepts {weight_kg} kg")
    return min(eligible, key=lambda rate: rate.price_cents(weight_kg))
