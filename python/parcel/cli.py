"""Command line entry point: `parcel quote 2.3`."""

import argparse
import sys

from parcel.rates import cheapest, load_rates


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="parcel")
    sub = parser.add_subparsers(dest="command", required=True)
    quote = sub.add_parser("quote", help="print the cheapest carrier for a weight")
    quote.add_argument("weight_kg", type=float)
    sub.add_parser("carriers", help="list carriers and their limits")
    args = parser.parse_args(argv)

    if args.command == "carriers":
        for rate in load_rates():
            print(f"{rate.carrier:<12} up to {rate.max_kg:g} kg")
        return 0

    try:
        rate = cheapest(load_rates(), args.weight_kg)
    except ValueError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1

    print(f"{rate.carrier}: ${rate.price_cents(args.weight_kg) / 100:.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
