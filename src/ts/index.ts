import { Shipment } from "./models";
import { formatQuote } from "./pricing";
import { Tracker } from "./tracker";

const tracker = new Tracker();

const demo: Shipment = {
  id: "shp_1001",
  carrier: "northwind",
  from: { name: "Warehouse 4", street: "12 Dock Rd", city: "Boston", postalCode: "02110", country: "US" },
  to: { name: "A. Customer", street: "88 Elm St", city: "Denver", postalCode: "80202", country: "US" },
  parcel: { weightGrams: 2300, lengthCm: 40, widthCm: 30, heightCm: 15 },
  events: [],
};

tracker.register(demo);
tracker.onEvent((shipment, event) => console.log(`[${shipment.id}] ${event.status}`));
tracker.record(demo.id, "in_transit", "Boston, MA");
tracker.record(demo.id, "out_for_delivery", "Denver, CO", "on vehicle 17");

console.log(tracker.summary(demo.id));
console.log(formatQuote(tracker.quoteFor(demo.id)));
for (const line of tracker.history(demo.id)) {
  console.log(line);
}
