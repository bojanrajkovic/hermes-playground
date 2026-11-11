import { Shipment, TrackingEvent, currentStatus } from "./models";
import { gramsToKg, roundTo } from "./utils";

const STATUS_LABELS = {
  created: "Label created",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Delivery exception",
} as const;

export function formatEvent(event: TrackingEvent): string {
  const time = event.at.toISOString().slice(0, 16).replace("T", " ");
  const note = event.note ? ` (${event.note})` : "";
  return `${time}  ${STATUS_LABELS[event.status]} at ${event.location}${note}`;
}

export function formatSummary(shipment: Shipment): string {
  const weight = roundTo(gramsToKg(shipment.parcel.weightGrams), 1);
  return `${shipment.id} [${shipment.carrier}] ${weight} kg, ${STATUS_LABELS[currentStatus(shipment)]}`;
}
