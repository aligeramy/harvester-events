import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://metaforge.app/api/arc-raiders/event-timers?name=Harvester', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    const harvesterEvents = data.data?.filter((event: any) => event.name === 'Harvester') || [];

    if (harvesterEvents.length === 0) {
      return NextResponse.json({ message: 'No Harvester events found' });
    }

    // Flatten all time slots
    const allTimeSlots: Array<{ start: string; end: string; map: string }> = [];
    harvesterEvents.forEach((event: any) => {
      event.times.forEach((time: any) => {
        allTimeSlots.push({
          start: time.start,
          end: time.end,
          map: event.map,
        });
      });
    });

    // Sort by time
    allTimeSlots.sort((a, b) => {
      const [aHour, aMin] = a.start.split(':').map(Number);
      const [bHour, bMin] = b.start.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });

    // Get current UTC time
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // Find next event
    let nextEvent = null;
    let minDiff = Infinity;

    for (const slot of allTimeSlots) {
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      
      let diff = startTime - currentTime;
      if (diff < 0) {
        diff += 24 * 60; // Next day
      }
      
      if (diff < minDiff) {
        minDiff = diff;
        nextEvent = {
          ...slot,
          hoursUntil: Math.floor(diff / 60),
          minutesUntil: diff % 60,
        };
      }
    }

    if (!nextEvent) {
      return NextResponse.json({ message: 'No upcoming events found' });
    }

    // Convert UTC to local time for display
    const [utcHour, utcMinute] = nextEvent.start.split(':').map(Number);
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      utcHour,
      utcMinute
    ));
    
    const localHour = utcDate.getHours();
    const localMinute = utcDate.getMinutes();
    
    // Format to 12-hour
    let startTime12 = '';
    if (localHour === 0) startTime12 = `12:${localMinute.toString().padStart(2, '0')} AM`;
    else if (localHour < 12) startTime12 = `${localHour}:${localMinute.toString().padStart(2, '0')} AM`;
    else if (localHour === 12) startTime12 = `12:${localMinute.toString().padStart(2, '0')} PM`;
    else startTime12 = `${localHour - 12}:${localMinute.toString().padStart(2, '0')} PM`;

    const [utcEndHour, utcEndMinute] = nextEvent.end.split(':').map(Number);
    const utcEndDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      utcEndHour,
      utcEndMinute
    ));
    
    const localEndHour = utcEndDate.getHours();
    const localEndMinute = utcEndDate.getMinutes();
    
    let endTime12 = '';
    if (localEndHour === 0) endTime12 = `12:${localEndMinute.toString().padStart(2, '0')} AM`;
    else if (localEndHour < 12) endTime12 = `${localEndHour}:${localEndMinute.toString().padStart(2, '0')} AM`;
    else if (localEndHour === 12) endTime12 = `12:${localEndMinute.toString().padStart(2, '0')} PM`;
    else endTime12 = `${localEndHour - 12}:${localEndMinute.toString().padStart(2, '0')} PM`;

    const responseText = `🌾 *Next Harvester Event*\n\n` +
      `📍 *${nextEvent.map}*\n` +
      `⏰ ${startTime12} - ${endTime12}\n` +
      `⏳ ${nextEvent.hoursUntil}h ${nextEvent.minutesUntil}m`;

    return NextResponse.json({
      text: responseText,
      map: nextEvent.map,
      start: startTime12,
      end: endTime12,
      hoursUntil: nextEvent.hoursUntil,
      minutesUntil: nextEvent.minutesUntil,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching next event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch next event' },
      { status: 500 }
    );
  }
}

