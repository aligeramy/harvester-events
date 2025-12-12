//
//  HarvesterTimingsIntents.swift
//  HarvesterTimingsIntents
//
//  Created by Realeyes on 12/12/25.
//

import AppIntents

struct HarvesterTimingsIntents: AppIntent {
    static var title: LocalizedStringResource { "HarvesterTimingsIntents" }
    
    func perform() async throws -> some IntentResult {
        return .result()
    }
}
