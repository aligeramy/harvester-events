import Foundation

class HarvesterAPIService {
    private let baseURL = "https://metaforge.app/api/arc-raiders/event-timers"
    
    func fetchHarvesterEvents() async throws -> [HarvesterEvent] {
        guard let url = URL(string: "\(baseURL)?name=Harvester") else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(EventTimersResponse.self, from: data)
        
        return processEvents(response.data)
    }
    
    func fetchAllEventsToday() async throws -> [HarvesterEvent] {
        guard let url = URL(string: "\(baseURL)?name=Harvester") else {
            throw APIError.invalidURL
        }
        
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(EventTimersResponse.self, from: data)
        
        return processAllEventsToday(response.data)
    }
    
    private func processEvents(_ events: [EventTimer]) -> [HarvesterEvent] {
        let harvesterEvents = events.filter { $0.name == "Harvester" }
        
        var allTimeSlots: [(start: String, end: String, map: String)] = []
        
        for event in harvesterEvents {
            for time in event.times {
                allTimeSlots.append((start: time.start, end: time.end, map: event.map))
            }
        }
        
        // Sort by start time
        allTimeSlots.sort { time1, time2 in
            let (h1, m1) = parseTime(time1.start)
            let (h2, m2) = parseTime(time2.start)
            return (h1 * 60 + m1) < (h2 * 60 + m2)
        }
        
        // Group by time
        var timeSlotsByTime: [String: (start: String, end: String, maps: [String], mapIcons: [String])] = [:]
        for slot in allTimeSlots {
            let key = "\(slot.start)-\(slot.end)"
            if timeSlotsByTime[key] == nil {
                timeSlotsByTime[key] = (start: slot.start, end: slot.end, maps: [], mapIcons: [])
            }
            if !timeSlotsByTime[key]!.maps.contains(slot.map) {
                timeSlotsByTime[key]!.maps.append(slot.map)
                timeSlotsByTime[key]!.mapIcons.append(getMapIconURL(slot.map))
            }
        }
        
        // Find current or next event - convert UTC times to local for comparison
        let now = Date()
        let calendar = Calendar.current
        let currentHour = calendar.component(.hour, from: now)
        let currentMinute = calendar.component(.minute, from: now)
        let currentTime = currentHour * 60 + currentMinute
        
        // First, check for current event
        var currentEvent: (start: String, end: String, maps: [String], mapIcons: [String])?
        
        for (_, slot) in timeSlotsByTime {
            let startTimeLocal = convertToLocalMinutes(slot.start)
            let endTimeLocal = convertToLocalMinutes(slot.end)
            
            // Check if currently happening
            if startTimeLocal <= endTimeLocal {
                // Same day event
                if currentTime >= startTimeLocal && currentTime < endTimeLocal {
                    currentEvent = slot
                    break
                }
            } else {
                // Overnight event
                if currentTime >= startTimeLocal || currentTime < endTimeLocal {
                    currentEvent = slot
                    break
                }
            }
        }
        
        // If we have a current event, return it with "Ends in"
        if let current = currentEvent {
            let endTimeLocal = convertToLocalMinutes(current.end)
            var diff = endTimeLocal - currentTime
            if diff < 0 {
                diff += 24 * 60
            }
            
            let hours = diff / 60
            let minutes = diff % 60
            let timeUntil: String
            if hours == 0 {
                timeUntil = "\(minutes)m"
            } else {
                timeUntil = "\(hours)h \(minutes)m"
            }
            
            let startFormatted = formatTime12Hour(current.start)
            let endFormatted = formatTime12Hour(current.end)
            
            return [HarvesterEvent(
                startTime: startFormatted,
                endTime: endFormatted,
                maps: current.maps,
                mapIcons: current.mapIcons,
                timeUntil: timeUntil,
                isCurrent: true
            )]
        }
        
        // Otherwise, find next event
        var nextEvent: (start: String, end: String, maps: [String], mapIcons: [String])?
        var minDiff = Int.max
        
        for (_, slot) in timeSlotsByTime {
            let startTimeLocal = convertToLocalMinutes(slot.start)
            let endTimeLocal = convertToLocalMinutes(slot.end)
            
            // Skip if event has already ended today (for same-day events)
            if endTimeLocal < currentTime && startTimeLocal < endTimeLocal {
                continue
            }
            
            var diff = startTimeLocal - currentTime
            if diff < 0 {
                diff += 24 * 60 // Next day
            }
            
            if diff < minDiff {
                minDiff = diff
                nextEvent = slot
            }
        }
        
        guard let next = nextEvent else { return [] }
        
        let hours = minDiff / 60
        let minutes = minDiff % 60
        let timeUntil: String
        if hours == 0 {
            timeUntil = "\(minutes)m"
        } else {
            timeUntil = "\(hours)h \(minutes)m"
        }
        
        let startFormatted = formatTime12Hour(next.start)
        let endFormatted = formatTime12Hour(next.end)
        
        return [HarvesterEvent(
            startTime: startFormatted,
            endTime: endFormatted,
            maps: next.maps,
            mapIcons: next.mapIcons,
            timeUntil: timeUntil,
            isCurrent: false
        )]
    }
    
    private func parseTime(_ time: String) -> (hour: Int, minute: Int) {
        let components = time.split(separator: ":")
        return (Int(components[0]) ?? 0, Int(components[1]) ?? 0)
    }
    
    private func getMapIconURL(_ mapName: String) -> String {
        let mapSlug = mapName.lowercased().replacingOccurrences(of: " ", with: "-")
        return "https://cdn.metaforge.app/arc-raiders/ui/\(mapSlug).webp"
    }
    
    private func processAllEventsToday(_ events: [EventTimer]) -> [HarvesterEvent] {
        let harvesterEvents = events.filter { $0.name == "Harvester" }
        
        var allTimeSlots: [(start: String, end: String, map: String)] = []
        
        for event in harvesterEvents {
            for time in event.times {
                allTimeSlots.append((start: time.start, end: time.end, map: event.map))
            }
        }
        
        // Sort by start time
        allTimeSlots.sort { time1, time2 in
            let (h1, m1) = parseTime(time1.start)
            let (h2, m2) = parseTime(time2.start)
            return (h1 * 60 + m1) < (h2 * 60 + m2)
        }
        
        // Group by time
        var timeSlotsByTime: [String: (start: String, end: String, maps: [String], mapIcons: [String])] = [:]
        for slot in allTimeSlots {
            let key = "\(slot.start)-\(slot.end)"
            if timeSlotsByTime[key] == nil {
                timeSlotsByTime[key] = (start: slot.start, end: slot.end, maps: [], mapIcons: [])
            }
            if !timeSlotsByTime[key]!.maps.contains(slot.map) {
                timeSlotsByTime[key]!.maps.append(slot.map)
                timeSlotsByTime[key]!.mapIcons.append(getMapIconURL(slot.map))
            }
        }
        
        // Get current time in local timezone
        let now = Date()
        let calendar = Calendar.current
        let currentHour = calendar.component(.hour, from: now)
        let currentMinute = calendar.component(.minute, from: now)
        let currentTime = currentHour * 60 + currentMinute
        
        // Filter out past events and convert to HarvesterEvent
        var result: [HarvesterEvent] = []
        
        for (_, slot) in timeSlotsByTime {
            let startTimeLocal = convertToLocalMinutes(slot.start)
            let endTimeLocal = convertToLocalMinutes(slot.end)
            
            // Skip if event has already ended today (for same-day events)
            if endTimeLocal < currentTime && startTimeLocal < endTimeLocal {
                continue
            }
            
            // Calculate time until
            var diff = startTimeLocal - currentTime
            if diff < 0 {
                diff += 24 * 60 // Next day
            }
            
            let hours = diff / 60
            let minutes = diff % 60
            let timeUntil: String
            if hours == 0 && minutes == 0 {
                timeUntil = "Now"
            } else if hours == 0 {
                timeUntil = "in \(minutes)m"
            } else {
                timeUntil = "in \(hours)h \(minutes)m"
            }
            
            let startFormatted = formatTime12Hour(slot.start)
            let endFormatted = formatTime12Hour(slot.end)
            
            // Check if currently happening (using already calculated startTimeLocal and endTimeLocal)
            let isCurrentlyHappening: Bool
            if startTimeLocal <= endTimeLocal {
                isCurrentlyHappening = currentTime >= startTimeLocal && currentTime < endTimeLocal
            } else {
                isCurrentlyHappening = currentTime >= startTimeLocal || currentTime < endTimeLocal
            }
            
            // If currently happening, calculate time until end
            var displayTimeUntil = timeUntil
            if isCurrentlyHappening {
                var diff = endTimeLocal - currentTime
                if diff < 0 {
                    diff += 24 * 60
                }
                let hours = diff / 60
                let minutes = diff % 60
                if hours == 0 {
                    displayTimeUntil = "\(minutes)m"
                } else {
                    displayTimeUntil = "\(hours)h \(minutes)m"
                }
            }
            
            result.append(HarvesterEvent(
                startTime: startFormatted,
                endTime: endFormatted,
                maps: slot.maps,
                mapIcons: slot.mapIcons,
                timeUntil: displayTimeUntil,
                isCurrent: isCurrentlyHappening
            ))
        }
        
        return result.sorted { event1, event2 in
            // Sort by start time
            let time1 = parseTimeFrom12Hour(event1.startTime)
            let time2 = parseTimeFrom12Hour(event2.startTime)
            return time1 < time2
        }
    }
    
    private func convertToLocalMinutes(_ time24: String) -> Int {
        let (hour, minute) = parseTime(time24)
        
        // Convert UTC to local time
        let now = Date()
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: now)
        components.hour = hour
        components.minute = minute
        components.timeZone = TimeZone(identifier: "UTC")
        
        guard let utcDate = calendar.date(from: components) else {
            return hour * 60 + minute
        }
        
        let localHour = calendar.component(.hour, from: utcDate)
        let localMinute = calendar.component(.minute, from: utcDate)
        return localHour * 60 + localMinute
    }
    
    private func parseTimeFrom12Hour(_ time12: String) -> Int {
        // Parse "3:00 PM" format
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        if let date = formatter.date(from: time12) {
            let calendar = Calendar.current
            return calendar.component(.hour, from: date) * 60 + calendar.component(.minute, from: date)
        }
        return 0
    }
    
    private func formatTime12Hour(_ time24: String) -> String {
        let (hour, minute) = parseTime(time24)
        
        // Convert UTC to local time
        let now = Date()
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: now)
        components.hour = hour
        components.minute = minute
        components.timeZone = TimeZone(identifier: "UTC")
        
        guard let utcDate = calendar.date(from: components) else {
            return time24
        }
        
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.locale = Locale.current
        return formatter.string(from: utcDate)
    }
}

struct EventTimersResponse: Codable {
    let data: [EventTimer]
}

struct EventTimer: Codable {
    let game: String
    let name: String
    let map: String
    let icon: String
    let description: String
    let days: [String]
    let times: [EventTime]
}

struct EventTime: Codable {
    let start: String
    let end: String
}

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        }
    }
}

