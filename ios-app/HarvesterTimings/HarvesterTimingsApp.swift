import SwiftUI
import Intents

@main
struct HarvesterTimingsApp: App {
    
    init() {
        // Donate intent to Siri so it becomes available
        donateIntentToSiri()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(nil) // Respect system dark mode setting
                .onAppear {
                    donateIntentToSiri()
                }
        }
    }
    
    private func donateIntentToSiri() {
        let intent = GetNextHarvesterEventIntent()
        intent.suggestedInvocationPhrase = "when is the next harvester event"
        
        // Create a response to make the donation more complete
        let response = GetNextHarvesterEventIntentResponse(code: .success, userActivity: nil)
        response.eventTime = "Loading..."
        
        let interaction = INInteraction(intent: intent, response: response)
        interaction.donate { error in
            if let error = error {
                print("❌ Failed to donate intent: \(error.localizedDescription)")
            } else {
                print("✅ Successfully donated intent to Siri")
                print("   Intent: GetNextHarvesterEvent")
                print("   Suggested phrase: 'when is the next harvester event'")
            }
        }
        
        // Also try to make it discoverable in Shortcuts
        if let shortcut = INShortcut(intent: intent) {
            INVoiceShortcutCenter.shared.setShortcutSuggestions([shortcut])
            print("✅ Shortcut suggestions set")
        }
    }
}

