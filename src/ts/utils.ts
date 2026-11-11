const GRAMS_PER_KG = 1000;
const GRAMS_PER_POUND = 453.592;

export function gramsToKg(grams: number): number {
  return grams / GRAMS_PER_KG;
}

export function gramsToPounds(grams: number): number {
  return grams / GRAMS_PER_POUND;
}

export function volumeLitres(lengthCm: number, widthCm: number, heightCm: number): number {
  return (lengthCm * widthCm * heightCm) / 1000;
}

export function roundTo(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}
