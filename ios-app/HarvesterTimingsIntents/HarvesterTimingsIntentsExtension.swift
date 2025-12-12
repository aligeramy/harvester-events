//
//  HarvesterTimingsIntentsExtension.swift
//  HarvesterTimingsIntents
//
//  Created by Realeyes on 12/12/25.
//

import Foundation

// ExtensionKit extensions require a @main entry point with __swift5_entry section
// This minimal entry point satisfies ExtensionKit requirements
// SiriKit Intents are handled via IntentHandler class specified in Info.plist NSExtensionPrincipalClass
@main
struct HarvesterTimingsIntentsExtension {
    static func main() {
        print("🔵 ExtensionKit main() called")
        // ExtensionKit entry point - required for ExtensionKit extensions
        // Actual intent handling is done by IntentHandler via NSExtensionPrincipalClass in Info.plist
        // The system will route intents to IntentHandler automatically
    }
}
