import { Shipment, ShipmentStatus, TrackingEvent, currentStatus } from "./models";
import { formatEvent, formatSummary } from "./format";
import { Quote, quote } from "./pricing";

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

    const event: TrackingEvent = { at: new Date(), status, location, note };
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

  active(): Shipment[] {
    const result: Shipment[] = [];
    for (const shipment of this.shipments.values()) {
      if (currentStatus(shipment) !== "delivered") {
        result.push(shipment);
      }
    }
    return result;
  }

  delivered(): Shipment[] {
    const result: Shipment[] = [];
    for (const shipment of this.shipments.values()) {
      if (currentStatus(shipment) === "delivered") {
        result.push(shipment);
      }
    }
    return result;
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
}
