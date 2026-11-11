export type ShipmentStatus = "created" | "in_transit" | "out_for_delivery" | "delivered" | "exception";

export interface Address {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Parcel {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface TrackingEvent {
  at: Date;
  status: ShipmentStatus;
  location: string;
  note?: string;
}

export interface Shipment {
  id: string;
  carrier: string;
  from: Address;
  to: Address;
  parcel: Parcel;
  events: TrackingEvent[];
}

export function currentStatus(shipment: Shipment): ShipmentStatus {
  const last = shipment.events[shipment.events.length - 1];
  return last ? last.status : "created";
}
