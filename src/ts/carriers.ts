export interface Carrier {
  id: string;
  name: string;
  baseCents: number;
  perKgCents: number;
  maxKg: number;
}

export class CarrierRegistry {
  private readonly carriers = new Map<string, Carrier>();

  add(carrier: Carrier): void {
    this.carriers.set(carrier.id, carrier);
  }

  get(id: string): Carrier | undefined {
    return this.carriers.get(id);
  }

  all(): Carrier[] {
    return [...this.carriers.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
}
