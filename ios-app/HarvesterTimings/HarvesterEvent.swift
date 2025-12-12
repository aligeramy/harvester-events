import Foundation

struct HarvesterEvent {
    let startTime: String
    let endTime: String
    let maps: [String]
    let mapIcons: [String] // Map icon URLs
    let timeUntil: String
    let isCurrent: Bool // Whether event is currently happening
}


