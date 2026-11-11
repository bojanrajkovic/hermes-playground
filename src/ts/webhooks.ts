import { Shipment, TrackingEvent } from "./models";
import { Tracker } from "./tracker";

export interface WebhookTarget {
  url: string;
  secret: string;
}

// TODO: sign the payload with the target secret and retry on 5xx.
export function attachWebhooks(tracker: Tracker, targets: WebhookTarget[]): void {
  tracker.onEvent((shipment: Shipment, event: TrackingEvent) => {
    if (event.status !== "delivered" && event.status !== "exception") {
      return;
    }
    for (const target of targets) {
      void fetch(target.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shipmentId: shipment.id, status: event.status, at: event.at }),
      }).catch((error) => console.error(`webhook to ${target.url} failed`, error));
    }
  });
}
