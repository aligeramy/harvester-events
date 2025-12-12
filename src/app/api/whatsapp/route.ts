import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get the message text from WhatsApp webhook
    const messageText = body.Body || body.message?.text || '';
    const from = body.From || body.from || '';
    
    // Check if user wants harvester info (you can customize trigger words)
    const triggerWords = ['harvester', 'next', 'event', 'harvest'];
    const shouldRespond = triggerWords.some(word => 
      messageText.toLowerCase().includes(word)
    );
    
    if (!shouldRespond) {
      return NextResponse.json({ message: 'No response needed' });
    }

    // Fetch next event
    const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/next-event`);
    const eventData = await eventResponse.json();

    if (eventData.error) {
      return NextResponse.json({
        message: 'Sorry, unable to fetch event data right now.'
      });
    }

    // Format response for WhatsApp
    const whatsappMessage = eventData.text || 
      `🌾 *Next Harvester Event*\n\n` +
      `📍 *${eventData.map}*\n` +
      `⏰ ${eventData.start} - ${eventData.end}\n` +
      `⏳ ${eventData.hoursUntil}h ${eventData.minutesUntil}m`;

    // Return in format that WhatsApp webhooks expect
    return NextResponse.json({
      to: from,
      message: whatsappMessage,
      // For Twilio format
      body: whatsappMessage,
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Also handle GET for webhook verification
export async function GET() {
  return NextResponse.json({ 
    message: 'WhatsApp webhook endpoint is active',
    usage: 'Send POST requests with WhatsApp message data'
  });
}

