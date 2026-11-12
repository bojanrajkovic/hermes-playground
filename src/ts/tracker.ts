import { Shipment, ShipmentStatus, TrackingEvent, currentStatus } from "./models";
import { formatEvent, formatSummary } from "./format";
import { Quote, quote } from "./pricing";
import { Zone, zoneBetween } from "./zones";

export class UnknownShipmentError extends Error {
  constructor(public readonly shipmentId: string) {
    super(`unknown shipment: ${shipmentId}`);
    this.name = "UnknownShipmentError";
  }
}

export class InvalidTransitionError extends Error {
  constructor(from: ShipmentStatus, to: ShipmentStatus) {
    super(`cannot move shipment from ${from} to ${to}`);
    this.name = "InvalidTransitionError";
  }
}

const ALLOWED: Record<ShipmentStatus, ShipmentStatus[]> = {
  created: ["in_transit", "exception"],
  in_transit: ["in_transit", "out_for_delivery", "exception"],
  out_for_delivery: ["delivered", "exception"],
  delivered: [],
  exception: ["in_transit"],
};

export type Listener = (shipment: Shipment, event: TrackingEvent) => void;

export class Tracker {
  private readonly shipments = new Map<string, Shipment>();
  private readonly listeners: Listener[] = [];

  register(shipment: Shipment): void {
    if (this.shipments.has(shipment.id)) {
      throw new Error(`shipment ${shipment.id} is already registered`);
    }
    this.shipments.set(shipment.id, shipment);
  }

  get(id: string): Shipment {
    const shipment = this.shipments.get(id);
    if (!shipment) {
      throw new UnknownShipmentError(id);
    }
    return shipment;
  }

  onEvent(listener: Listener): void {
    this.listeners.push(listener);
  }

  record(id: string, status: ShipmentStatus, location: string, note?: string): TrackingEvent {
    const shipment = this.get(id);
    const from = currentStatus(shipment);
    if (!ALLOWED[from].includes(status)) {
      throw new InvalidTransitionError(from, status);
    }

    const event: TrackingEvent = { at: new Date(), status, location: location.trim(), note };
    shipment.events.push(event);

    for (const listener of this.listeners) {
      listener(shipment, event);
    }
    return event;
  }

  history(id: string): string[] {
    return this.get(id).events.map(formatEvent);
  }

  summary(id: string): string {
    return formatSummary(this.get(id));
  }

  quoteFor(id: string): Quote {
    return quote(this.get(id));
  }

  zoneFor(id: string): Zone {
    const shipment = this.get(id);
    return zoneBetween(shipment.from, shipment.to);
  }

  active(): Shipment[] {
    return this.filter((status) => status !== "delivered");
  }

  delivered(): Shipment[] {
    return this.filter((status) => status === "delivered");
  }

  byZone(zone: Zone): Shipment[] {
    return [...this.shipments.values()].filter((s) => zoneBetween(s.from, s.to) === zone);
  }

  countByStatus(): Record<ShipmentStatus, number> {
    const counts: Record<ShipmentStatus, number> = {
      created: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      exception: 0,
    };
    for (const shipment of this.shipments.values()) {
      counts[currentStatus(shipment)] += 1;
    }
    return counts;
  }

  remove(id: string): boolean {
    return this.shipments.delete(id);
  }

  clear(): void {
    this.shipments.clear();
  }

  private filter(keep: (status: ShipmentStatus) => boolean): Shipment[] {
    return [...this.shipments.values()].filter((shipment) => keep(currentStatus(shipment)));
  }
}
