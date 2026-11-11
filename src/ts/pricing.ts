import { Parcel, Shipment } from "./models";
import { gramsToKg, roundTo, volumeLitres } from "./units";

export interface Quote {
  carrier: string;
  amountCents: number;
  currency: "USD";
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
  const amountCents = Math.round(BASE_RATE_CENTS + weight * PER_KG_CENTS);
  return { carrier: shipment.carrier, amountCents, currency: "USD" };
}

export function formatQuote(q: Quote): string {
  return `${q.carrier}: $${(q.amountCents / 100).toFixed(2)}`;
}
