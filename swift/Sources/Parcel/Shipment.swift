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

public enum Zone: Int, Codable, CaseIterable {
    case local = 1
    case regional = 2
    case national = 3

    public var multiplier: Double {
        switch self {
        case .local: 1.0
        case .regional: 1.25
        case .national: 1.6
        }
    }
}

public struct Shipment: Identifiable, Codable, Equatable {
    public let id: String
    public var carrier: String
    public var status: ShipmentStatus
    public var weightGrams: Int
    public var zone: Zone

    public init(id: String, carrier: String, status: ShipmentStatus = .created, weightGrams: Int, zone: Zone) {
        self.id = id
        self.carrier = carrier
        self.status = status
        self.weightGrams = weightGrams
        self.zone = zone
    }

    public var weightDescription: String {
        let kilograms = Measurement(value: Double(weightGrams) / 1000, unit: UnitMass.kilograms)
        return kilograms.formatted(.measurement(width: .abbreviated))
    }
}
