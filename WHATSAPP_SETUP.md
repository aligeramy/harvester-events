# WhatsApp Integration Setup Guide

## Quick Setup Options

### Option 1: Twilio WhatsApp API (Recommended for Quick Setup)

1. **Sign up for Twilio**
   - Go to https://www.twilio.com
   - Create an account
   - Get a WhatsApp-enabled number

2. **Configure Webhook**
   - In Twilio Console → Messaging → WhatsApp Sandbox
   - Set webhook URL to: `https://your-domain.com/api/whatsapp`
   - When someone sends a message, Twilio will POST to your endpoint

3. **Test it**
   - Send "harvester" or "next" to your Twilio WhatsApp number
   - You'll get the next event info back!

### Option 2: WhatsApp Business API (Official)

1. **Set up Meta Business Account**
   - Go to https://business.facebook.com
   - Create a business account
   - Apply for WhatsApp Business API access

2. **Configure Webhook**
   - In Meta Developer Console
   - Set webhook URL: `https://your-domain.com/api/whatsapp`
   - Subscribe to `messages` events

### Option 3: Simple Testing

You can test the API endpoint directly:

```bash
# Get next event
curl https://your-domain.com/api/next-event

# Response format:
{
  "text": "🌾 *Next Harvester Event*\n\n📍 *Dam*\n⏰ 3:00 PM - 4:00 PM\n⏳ 5h 30m",
  "map": "Dam",
  "start": "3:00 PM",
  "end": "4:00 PM",
  "hoursUntil": 5,
  "minutesUntil": 30
}
```

## Customization

Edit `/src/app/api/whatsapp/route.ts` to:
- Change trigger words (currently: 'harvester', 'next', 'event', 'harvest')
- Customize the message format
- Add more features

## Deployment

1. Deploy your Next.js app (Vercel, Netlify, etc.)
2. Update webhook URL in Twilio/Meta to your deployed URL
3. Test by sending a message!

## Example WhatsApp Response

When user sends: "harvester" or "next"

Bot responds:
```
🌾 *Next Harvester Event*

📍 *Dam*
⏰ 3:00 PM - 4:00 PM
⏳ 5h 30m
```

