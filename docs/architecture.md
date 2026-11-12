# Architecture

Parcel is split by language so each part stays small. The TypeScript library owns the
shipment state machine. The Go server exposes it over HTTP. Python and Rust are tools.

## Components

| Component | Language | Path | Responsibility |
| --- | --- | --- | --- |
| Tracker | TypeScript | `src/ts` | Shipment state machine |
| Pricing | TypeScript | `src/ts/pricing.ts`, `src/ts/zones.ts` | Zone-based quotes |
| Server | Go | `go/cmd/server` | Read-only HTTP API |
| Rates CLI | Python | `python/parcel` | Cheapest-carrier lookup |
| Label checker | Rust | `rust` | Tracking number validation |
| App model | Swift | `swift` | Models for the macOS client |

## Request flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Go server
    participant T as Store
    participant Z as Zones
    C->>S: GET /shipments/shp_1001
    S->>T: Get("shp_1001")
    T-->>S: Shipment
    S->>Z: zoneBetween(from, to)
    Z-->>S: Zone 3
    S-->>C: 200 JSON with zone
```

## Shipment states

```mermaid
stateDiagram-v2
    [*] --> created
    created --> in_transit
    in_transit --> out_for_delivery
    out_for_delivery --> delivered
    in_transit --> exception
    exception --> in_transit
    delivered --> [*]
```

## Pricing

A quote is the base rate plus a per-kilogram charge on the billable weight, multiplied by
the zone multiplier. Billable weight is the larger of actual weight and volumetric weight
(litres divided by 5). The zone comes from the first digit of each postal code.

```mermaid
flowchart LR
    P[Postal codes] --> Z{Region distance}
    Z -->|0 to 1| Z1[Zone 1]
    Z -->|2 to 4| Z2[Zone 2]
    Z -->|5 or more| Z3[Zone 3]
    Z1 & Z2 & Z3 --> Q[Quote]
```

| Input | Value |
| --- | --- |
| Base rate | $4.50 |
| Per kg | $1.20 |
| Volumetric divisor | 5 |

| Zone | Region distance | Multiplier |
| ---: | --- | ---: |
| 1 | 0 to 1 | 1.00 |
| 2 | 2 to 4 | 1.25 |
| 3 | 5 or more | 1.60 |
