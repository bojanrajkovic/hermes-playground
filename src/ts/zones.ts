import { Address } from "./models";

export type Zone = 1 | 2 | 3;

const MULTIPLIERS: Record<Zone, number> = {
  1: 1.0,
  2: 1.25,
  3: 1.6,
};

// US postal codes start with a region digit, 0 in the northeast through 9 on the west coast.
function region(address: Address): number {
  const digit = Number.parseInt(address.postalCode.charAt(0), 10);
  if (Number.isNaN(digit)) {
    throw new Error(`postal code ${address.postalCode} has no region digit`);
  }
  return digit;
}

export function zoneBetween(from: Address, to: Address): Zone {
  const distance = Math.abs(region(from) - region(to));
  if (distance <= 1) {
    return 1;
  }
  if (distance <= 4) {
    return 2;
  }
  return 3;
}

export function zoneMultiplier(zone: Zone): number {
  return MULTIPLIERS[zone];
}
