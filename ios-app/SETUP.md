# Quick Setup Guide for Siri Integration

## Step 1: Open Project in Xcode
1. Open `HarvesterTimings.xcodeproj` in Xcode
2. Update Bundle Identifier: `com.yourname.HarvesterTimings`
3. Set your Development Team in Signing & Capabilities

## Step 2: Create Intent Extension
1. File > New > Target
2. Choose **Intents Extension**
3. Name: `HarvesterTimingsIntents`
4. **Uncheck** "Include UI Extension"
5. Click Finish

## Step 3: Move IntentHandler to Extension
1. Select `IntentHandler.swift` in Project Navigator
2. In File Inspector, add it to "HarvesterTimingsIntents" target
3. Remove it from main app target

## Step 4: Create Intent Definitions
1. File > New > File
2. Choose **SiriKit Intent Definition File**
3. Name: `HarvesterTimingsIntents.intentdefinition`
4. Add to both app and extension targets

### Intent 1: GetNextHarvesterEvent
1. Click "+" to add new Intent
2. Name: `GetNextHarvesterEvent`
3. Title: "Get Next Harvester Event"
4. Category: **Information**
5. Description: "Get the next Harvester event time"

**Response Parameters:**
- `eventTime` (String) - Title: "Event Time"
- `timeUntil` (String) - Title: "Time Until"
- `maps` (String) - Title: "Maps"

**Siri Phrases:**
- "when is the next harvester event"
- "next harvester"
- "harvester event"
- "when harvester"

### Intent 2: GetAllHarvesterTimes
1. Click "+" to add another Intent
2. Name: `GetAllHarvesterTimes`
3. Title: "Get All Harvester Times"
4. Category: **Information**
5. Description: "Get all Harvester event times for today"

**Response Parameters:**
- `allTimes` (String) - Title: "All Times"
- `count` (Integer) - Title: "Count"

**Siri Phrases:**
- "when are all the times today"
- "all harvester times"
- "all times harvester"
- "harvester times today"

## Step 5: Update IntentHandler
Uncomment the code in `IntentHandler.swift` after Xcode generates the Intent types.

Make sure it conforms to both protocols:
```swift
class IntentHandler: INExtension, GetNextHarvesterEventIntentHandling, GetAllHarvesterTimesIntentHandling {
    // ... implementation
}
```

## Step 6: Test
1. Build and run on device
2. Test phrases:
   - "Hey Siri, when is the next harvester event?"
   - "Hey Siri, when are all the times today?"
3. Siri should respond with the event information

## Troubleshooting
- Make sure Intent Definition is added to both targets
- Check that IntentHandler is in the extension target
- Verify Siri phrases are set correctly
- Test on a physical device (Siri doesn't work in simulator)
- Ensure AM/PM formatting is correct in your device's locale settings
