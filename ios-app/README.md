# Harvester Timings iOS App with Siri Integration

A simple iOS app that lets you ask Siri "when is the next harvester event" and get an answer.

## Setup Instructions

1. **Open in Xcode:**
   - Open `HarvesterTimings.xcodeproj` in Xcode
   - Update the Bundle Identifier in project settings to your own (e.g., `com.yourname.HarvesterTimings`)
   - Set your Development Team

2. **Add Siri Intent Extension:**
   - In Xcode, go to File > New > Target
   - Choose "Intents Extension"
   - Name it "HarvesterTimingsIntents"
   - Make sure "Include UI Extension" is unchecked
   - Move `IntentHandler.swift` to the Intents Extension target

3. **Create Intent Definition:**
   - File > New > File > SiriKit Intent Definition File
   - Name it "HarvesterTimingsIntents.intentdefinition"
   - Add a new Intent called "GetNextHarvesterEvent"
   - Set title: "Get Next Harvester Event"
   - Set category: "Information"
   - Add response parameters:
     - `eventTime` (String)
     - `timeUntil` (String)  
     - `maps` (String)
   - Add phrases: "when is the next harvester event", "next harvester", "harvester event"

4. **Configure App Groups (if needed):**
   - For sharing data between app and extension, you may need App Groups
   - Go to Signing & Capabilities > Add Capability > App Groups

5. **Build and Run:**
   - Build the app
   - Test Siri integration by saying "Hey Siri, when is the next harvester event"

## Features

- ✅ Fetches Harvester events from MetaForge API
- ✅ Shows next event in app UI
- ✅ Siri integration for voice queries
- ✅ Works on iPhone, iPad, and HomePod
- ✅ Displays time in user's local timezone

## Siri Phrases

You can ask Siri:
- "When is the next harvester event?"
- "Next harvester"
- "Harvester event"

## Notes

- The app uses the MetaForge API endpoint: `https://metaforge.app/api/arc-raiders/event-timers`
- Times are converted from UTC to the user's local timezone
- The Intent Extension handles Siri requests asynchronously

