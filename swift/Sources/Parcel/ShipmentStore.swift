import Foundation

public enum ShipmentStoreError: Error, Equatable {
    case notFound(String)
    case alreadyDelivered(String)
}

public actor ShipmentStore {
    private var shipments: [String: Shipment] = [:]

    public init() {}

    public func add(_ shipment: Shipment) {
        shipments[shipment.id] = shipment
    }

    public func shipment(id: String) throws -> Shipment {
        guard let shipment = shipments[id] else {
            throw ShipmentStoreError.notFound(id)
        }
        return shipment
    }

    public func update(id: String, status: ShipmentStatus) throws {
        var shipment = try shipment(id: id)
        guard !shipment.status.isTerminal else {
            throw ShipmentStoreError.alreadyDelivered(id)
        }
        shipment.status = status
        shipments[id] = shipment
    }

    public func active() -> [Shipment] {
        shipments.values.filter { !$0.status.isTerminal }.sorted { $0.id < $1.id }
    }
}
