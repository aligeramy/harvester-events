import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = HarvesterViewModel()
    @Environment(\.colorScheme) var colorScheme
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    if viewModel.isLoading {
                        ProgressView("Loading events...")
                            .padding()
                            .foregroundColor(.primary)
                    } else if let error = viewModel.error {
                        Text("Error: \(error)")
                            .foregroundColor(.red)
                            .padding()
                    } else {
                        // Current/Next Event Card
                        if let nextEvent = viewModel.nextEvent {
                            HStack(alignment: .top, spacing: 12) {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text(nextEvent.isCurrent ? "Current Harvester Event" : "Next Harvester Event")
                                        .font(.headline)
                                        .foregroundColor(.secondary)
                                    
                                    Text("\(nextEvent.startTime) - \(nextEvent.endTime)")
                                        .font(.title2)
                                        .fontWeight(.semibold)
                                        .foregroundColor(.primary)
                                    
                                    HStack(spacing: 4) {
                                        Text(nextEvent.isCurrent ? "Ends in" : "Starts in")
                                            .font(.subheadline)
                                            .foregroundColor(nextEvent.isCurrent ? .orange : .blue)
                                        
                                        Text(nextEvent.timeUntil)
                                            .font(.subheadline)
                                            .fontWeight(.semibold)
                                            .foregroundColor(nextEvent.isCurrent ? .orange : .blue)
                                    }
                                    
                                    Text("Map: \(nextEvent.maps.joined(separator: ", "))")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                // Map Icons on the right - square, matches content height
                                if !nextEvent.mapIcons.isEmpty, let firstIconURL = nextEvent.mapIcons.first {
                                    AsyncImage(url: URL(string: firstIconURL)) { image in
                                        image
                                            .resizable()
                                            .aspectRatio(contentMode: .fill)
                                    } placeholder: {
                                        Rectangle()
                                            .fill(Color(.systemGray5))
                                    }
                                    .frame(width: 70, height: 70)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(
                                nextEvent.isCurrent
                                    ? (colorScheme == .dark 
                                        ? Color.orange.opacity(0.2)
                                        : Color.orange.opacity(0.1))
                                    : (colorScheme == .dark 
                                        ? Color(.systemGray6).opacity(0.6)
                                        : Color(.systemGray6))
                            )
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(nextEvent.isCurrent ? Color.orange.opacity(0.5) : Color.clear, lineWidth: 2)
                            )
                            .cornerRadius(12)
                            .shadow(color: colorScheme == .dark ? Color.black.opacity(0.3) : Color.gray.opacity(0.2), radius: 5)
                        }
                        
                        // All Events Today
                        if !viewModel.allEvents.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("All Events Today")
                                    .font(.headline)
                                    .foregroundColor(.secondary)
                                
                                ForEach(Array(viewModel.allEvents.enumerated()), id: \.offset) { index, event in
                                    HStack(alignment: .top, spacing: 12) {
                                        // Map Icons
                                        if !event.mapIcons.isEmpty {
                                            HStack(spacing: 6) {
                                                ForEach(Array(event.mapIcons.enumerated()), id: \.offset) { _, iconURL in
                                                    AsyncImage(url: URL(string: iconURL)) { image in
                                                        image
                                                            .resizable()
                                                            .aspectRatio(contentMode: .fill)
                                                    } placeholder: {
                                                        Rectangle()
                                                            .fill(Color(.systemGray5))
                                                    }
                                                    .frame(width: 40, height: 40)
                                                    .clipShape(RoundedRectangle(cornerRadius: 6))
                                                }
                                            }
                                        }
                                        
                                        VStack(alignment: .leading, spacing: 8) {
                                            HStack {
                                                Text("\(event.startTime) - \(event.endTime)")
                                                    .font(.body)
                                                    .fontWeight(.medium)
                                                    .foregroundColor(.primary)
                                                
                                                Spacer()
                                                
                                                HStack(spacing: 4) {
                                                    Text(event.isCurrent ? "Ends in" : "in")
                                                        .font(.caption)
                                                        .foregroundColor(event.isCurrent ? .orange : .blue)
                                                    
                                                    Text(event.timeUntil)
                                                        .font(.caption)
                                                        .fontWeight(event.isCurrent ? .semibold : .regular)
                                                        .foregroundColor(event.isCurrent ? .orange : .blue)
                                                }
                                            }
                                            
                                            Text("Map: \(event.maps.joined(separator: ", "))")
                                                .font(.caption)
                                                .foregroundColor(.secondary)
                                        }
                                    }
                                    .padding(.vertical, 8)
                                    
                                    if index < viewModel.allEvents.count - 1 {
                                        Divider()
                                            .background(colorScheme == .dark ? Color(.systemGray4) : Color(.systemGray3))
                                    }
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(
                                colorScheme == .dark 
                                    ? Color(.systemGray6).opacity(0.6)
                                    : Color(.systemGray6)
                            )
                            .cornerRadius(12)
                            .shadow(color: colorScheme == .dark ? Color.black.opacity(0.3) : Color.gray.opacity(0.2), radius: 5)
                        } else if viewModel.nextEvent == nil {
                            Text("No upcoming events")
                                .foregroundColor(.secondary)
                                .padding()
                        }
                    }
                }
                .padding()
            }
            .background(colorScheme == .dark ? Color(.systemBackground) : Color(.systemGroupedBackground))
            .navigationTitle("Harvester Events")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await viewModel.fetchEvents()
            }
        }
        .preferredColorScheme(nil) // Use system setting
    }
}

