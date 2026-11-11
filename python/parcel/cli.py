"""Command line entry point: `parcel quote 2.3`."""

import argparse
import sys

from parcel.rates import cheapest, load_rates


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="parcel")
    sub = parser.add_subparsers(dest="command", required=True)
    quote = sub.add_parser("quote", help="print the cheapest carrier for a weight")
    quote.add_argument("weight_kg", type=float)
    args = parser.parse_args(argv)

    try:
        rate = cheapest(load_rates(), args.weight_kg)
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    print(f"{rate.carrier}: ${rate.price_cents(args.weight_kg) / 100:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
