import Foundation

public enum ShipmentStatus: String, Codable, CaseIterable {
    case created
    case inTransit = "in_transit"
    case outForDelivery = "out_for_delivery"
    case delivered
    case exception

    public var isTerminal: Bool {
        self == .delivered
    }
}

public struct Shipment: Identifiable, Codable, Equatable {
    public let id: String
    public var carrier: String
    public var status: ShipmentStatus
    public var weightGrams: Int

    public init(id: String, carrier: String, status: ShipmentStatus = .created, weightGrams: Int) {
        self.id = id
        self.carrier = carrier
        self.status = status
        self.weightGrams = weightGrams
    }

    public var weightDescription: String {
        let kilograms = Measurement(value: Double(weightGrams) / 1000, unit: UnitMass.kilograms)
        return kilograms.formatted(.measurement(width: .abbreviated))
    }
}
