import { Parcel, Shipment } from "./models";
import { centsToDollars, gramsToKg, roundTo, volumeLitres } from "./units";
import { Zone, zoneBetween, zoneMultiplier } from "./zones";

export interface Quote {
  carrier: string;
  amountCents: number;
  currency: "USD";
  zone: Zone;
}

const BASE_RATE_CENTS = 450;
const PER_KG_CENTS = 120;
const VOLUMETRIC_DIVISOR = 5;

export function billableWeightKg(parcel: Parcel): number {
  const actual = gramsToKg(parcel.weightGrams);
  const volumetric = volumeLitres(parcel.lengthCm, parcel.widthCm, parcel.heightCm) / VOLUMETRIC_DIVISOR;
  return roundTo(Math.max(actual, volumetric), 2);
}

export function quote(shipment: Shipment): Quote {
  const weight = billableWeightKg(shipment.parcel);
  const zone = zoneBetween(shipment.from, shipment.to);
  const amountCents = Math.round((BASE_RATE_CENTS + weight * PER_KG_CENTS) * zoneMultiplier(zone));
  return { carrier: shipment.carrier, amountCents, currency: "USD", zone };
}

export function formatQuote(q: Quote): string {
  return `${q.carrier}: $${centsToDollars(q.amountCents)} (zone ${q.zone})`;
}
