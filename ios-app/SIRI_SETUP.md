# Complete Siri Setup Guide

## Prerequisites
- Xcode installed
- Apple Developer account (free account works)
- Physical iOS device (Siri doesn't work in simulator)

## Step-by-Step Setup

### Step 1: Create Intents Extension Target

1. Open `HarvesterTimings.xcodeproj` in Xcode
2. Go to **File > New > Target**
3. Select **Intents Extension**
4. Name it: `HarvesterTimingsIntents`
5. **IMPORTANT**: Uncheck "Include UI Extension"
6. Click **Finish**
7. When prompted, click **Activate** to add the scheme

### Step 2: Move IntentHandler to Extension

1. In Project Navigator, find `IntentHandler.swift`
2. Select the file
3. In File Inspector (right panel), under **Target Membership**:
   - ✅ Check `HarvesterTimingsIntents`
   - ❌ Uncheck `HarvesterTimings` (main app)
4. Also move `HarvesterAPIService.swift` to the extension:
   - Select `HarvesterAPIService.swift`
   - In File Inspector, check both targets:
     - ✅ `HarvesterTimingsIntents`
     - ✅ `HarvesterTimings` (keep it in main app too)

### Step 3: Create Intent Definition File

1. Go to **File > New > File**
2. Select **SiriKit Intent Definition File**
3. Name it: `HarvesterTimingsIntents.intentdefinition`
4. **IMPORTANT**: Add to BOTH targets:
   - ✅ `HarvesterTimings`
   - ✅ `HarvesterTimingsIntents`
5. Click **Create**

### Step 4: Configure Intent 1 - GetNextHarvesterEvent

1. In the Intent Definition file, click the **+** button at bottom left
2. Select **New Intent**
3. Configure:
   - **Name**: `GetNextHarvesterEvent`
   - **Title**: "Get Next Harvester Event"
   - **Description**: "Get the next Harvester event time"
   - **Category**: Select **Information**
   - **Supported by**: Check **Siri**

4. Add **Response Parameters** (these are the OUTPUT values your intent returns):
   - In the Intent editor, find the **"Response"** section (usually on the right side)
   - Click the **+** button under Response to add parameters
   - Add these output parameters:
     - `eventTime` (String) - Title: "Event Time"
     - `timeUntil` (String) - Title: "Time Until"  
     - `maps` (String) - Title: "Maps"
   - **Note**: In latest Xcode, these may be labeled as "Response Parameters" (output values) vs "Parameters" (input values). Make sure you're adding them to the **Response** section, not the Parameters section

5. **Siri Phrases** (Optional - Not in Intent Definition UI):
   - **Important**: In recent Xcode versions, there is NO "Siri Phrases" section in the Intent Definition editor
   - Siri will automatically generate invocation phrases based on your Intent's **Title** and **Description**
   - Users can customize phrases later in the **Shortcuts app** after installing your app
   - You can also set a suggested phrase programmatically when donating the intent (see Step 5)
   - **For now**: Just make sure your Title and Description are clear (which you already did!)

### Step 5: Update IntentHandler.swift

1. Open `IntentHandler.swift` in the Intents Extension target
2. Uncomment the `GetNextHarvesterEvent` handler code (the first function)
3. Change the class declaration to:
   ```swift
   class IntentHandler: INExtension, GetNextHarvesterEventIntentHandling {
   ```
4. Make sure `HarvesterAPIService.swift` is accessible in the extension target
5. **Leave the `GetAllHarvesterTimes` handler commented out for now** (we'll add it later after testing)

### Step 6: Configure Extension Info.plist

1. Select `HarvesterTimingsIntents` target
2. Go to **Info** tab
3. Add **NSExtension** dictionary if not present:
   - **NSExtensionPointIdentifier**: `com.apple.intents-service`
   - **NSExtensionPrincipalClass**: `$(PRODUCT_MODULE_NAME).IntentHandler`

### Step 7: Build and Run

1. Select **HarvesterTimingsIntents** scheme
2. Build (⌘B) to check for errors
3. Switch back to **HarvesterTimings** scheme
4. Connect your iPhone/iPad
5. Build and Run (⌘R) on device

### Step 8: Test Siri

1. On your device, say: **"Hey Siri, when is the next harvester event?"**
2. Or try: **"Hey Siri, next harvester"**
3. Siri should respond with the event information

## Troubleshooting

### Siri doesn't recognize the app
- Make sure you're testing on a **physical device** (not simulator)
- Try: "Hey Siri, ask HarvesterTimings when is the next harvester event"
- Check that Intent Definition is added to both targets
- Rebuild and reinstall the app

### "No such module" errors
- Make sure `HarvesterAPIService.swift` is added to the Intents Extension target
- Clean build folder (⌘⇧K) and rebuild

### Intent Handler not found
- Verify `IntentHandler.swift` is in the Intents Extension target
- Check Info.plist has correct `NSExtensionPrincipalClass`

### Siri says "I can't help with that"
- Verify Intent Definition file is added to both targets
- Check Siri phrases are configured correctly
- Try more specific phrases like "ask HarvesterTimings..."

### Can't find "Siri Phrases" section
- **This is normal!** The "Siri Phrases" section doesn't exist in the Intent Definition editor in recent Xcode versions
- Siri automatically generates phrases from your Intent's **Title** and **Description**
- Users can customize phrases in the **Shortcuts app** after installing your app
- Make sure your Intent has:
  - ✅ Category: **Information**
  - ✅ Supported by: **Siri** checked
  - ✅ Clear Title and Description

## Quick Test Commands

Once set up, try these:
- "Hey Siri, when is the next harvester event?"
- "Hey Siri, next harvester"
- "Hey Siri, ask HarvesterTimings what time is harvester?"

## Notes

- First time Siri may need to learn your voice/phrases
- Intent Definition must be in both app and extension targets
- Siri requires network access (app needs internet permission)
- Test on device, not simulator

