// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Parcel",
    platforms: [.macOS(.v13)],
    products: [.library(name: "Parcel", targets: ["Parcel"])],
    targets: [.target(name: "Parcel")]
)
