import Foundation

@MainActor
class HarvesterViewModel: ObservableObject {
    @Published var nextEvent: HarvesterEvent?
    @Published var allEvents: [HarvesterEvent] = []
    @Published var isLoading = false
    @Published var error: String?
    
    private let apiService = HarvesterAPIService()
    
    func fetchEvents() async {
        isLoading = true
        error = nil
        
        do {
            let events = try await apiService.fetchHarvesterEvents()
            nextEvent = events.first
            
            // Also fetch all events for today
            let allToday = try await apiService.fetchAllEventsToday()
            allEvents = allToday
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
}

