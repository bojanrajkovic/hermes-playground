// Flat-rate pricing kept for the v0 API. Nothing imports this any more.
export function flatRateCents(weightGrams: number): number {
  if (weightGrams <= 500) {
    return 399;
  }
  if (weightGrams <= 2000) {
    return 799;
  }
  return 1499;
}

export function legacyLabel(id: string): string {
  return "PKG-" + id.toUpperCase();
}
