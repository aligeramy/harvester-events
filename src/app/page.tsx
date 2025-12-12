'use client';

import { useEffect, useState } from 'react';

interface EventTime {
  start: string;
  end: string;
}

interface EventTimer {
  game: string;
  name: string;
  map: string;
  icon: string;
  description: string;
  days: string[];
  times: EventTime[];
}

export default function Home() {
  const [events, setEvents] = useState<EventTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/event-timers?name=Harvester');
        if (!response.ok) {
          throw new Error('Failed to fetch event timers');
        }
        const data = await response.json();
        setEvents(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filter only Harvester events
  const harvesterEvents = events.filter(event => event.name === 'Harvester');

  // Flatten all time slots with their maps and sort by time
  interface TimeSlot {
    start: string;
    end: string;
    map: string;
    icon: string;
  }

  const allTimeSlots: TimeSlot[] = harvesterEvents.flatMap(event =>
    event.times.map(time => ({
      start: time.start,
      end: time.end,
      map: event.map,
      icon: event.icon,
    }))
  );

  // Sort all time slots chronologically
  const sortedTimeSlots = allTimeSlots.sort((a, b) => {
    const [aHour, aMin] = a.start.split(':').map(Number);
    const [bHour, bMin] = b.start.split(':').map(Number);
    return aHour * 60 + aMin - (bHour * 60 + bMin);
  });

  // Group time slots by time (in case multiple maps have same time)
  const timeSlotsByTime = sortedTimeSlots.reduce((acc, slot) => {
    const timeKey = `${slot.start}-${slot.end}`;
    if (!acc[timeKey]) {
      acc[timeKey] = {
        start: slot.start,
        end: slot.end,
        maps: [],
      };
    }
    acc[timeKey].maps.push({
      map: slot.map,
      icon: slot.icon,
    });
    return acc;
  }, {} as Record<string, { start: string; end: string; maps: { map: string; icon: string }[] }>);

  // Get current local time
  const getLocalTime = () => {
    const now = new Date();
    return {
      hour: now.getHours(),
      minute: now.getMinutes(),
      totalMinutes: now.getHours() * 60 + now.getMinutes()
    };
  };

  // Convert UTC time to local time and format to 12-hour format
  const formatTimeLocal = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    
    // API times are in UTC, convert to local time
    const now = new Date();
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hour,
      minute
    ));
    
    // Convert to local time
    const localHour = utcDate.getHours();
    const localMinute = utcDate.getMinutes();
    
    // Format to 12-hour
    if (localHour === 0) return `12:${localMinute.toString().padStart(2, '0')} AM`;
    if (localHour < 12) return `${localHour}:${localMinute.toString().padStart(2, '0')} AM`;
    if (localHour === 12) return `12:${localMinute.toString().padStart(2, '0')} PM`;
    return `${localHour - 12}:${localMinute.toString().padStart(2, '0')} PM`;
  };

  // Convert UTC time to local minutes for comparison
  const convertToLocalMinutes = (time24: string) => {
    const [hour, minute] = time24.split(':').map(Number);
    const now = new Date();
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hour,
      minute
    ));
    return utcDate.getHours() * 60 + utcDate.getMinutes();
  };

  // Get current/next occurrence
  const getCurrentOrNextOccurrence = () => {
    const localNow = getLocalTime();
    const currentTime = localNow.totalMinutes;

    // First, check if there's a current occurrence (happening right now)
    for (const timeSlot of Object.values(timeSlotsByTime)) {
      const startTime = convertToLocalMinutes(timeSlot.start);
      const endTime = convertToLocalMinutes(timeSlot.end);
      
      // Check if current time is between start and end
      if (startTime <= endTime) {
        // Same day event
        if (currentTime >= startTime && currentTime < endTime) {
          return { timeSlot, isCurrent: true };
        }
      } else {
        // Overnight event (e.g., 23:00 - 01:00)
        if (currentTime >= startTime || currentTime < endTime) {
          return { timeSlot, isCurrent: true };
        }
      }
    }

    // If no current occurrence, find the next one
    let nextTimeSlot: { start: string; end: string; maps: { map: string; icon: string }[] } | null = null;
    let minDiff = Infinity;

    for (const timeSlot of Object.values(timeSlotsByTime)) {
      const startTime = convertToLocalMinutes(timeSlot.start);
      
      let diff = startTime - currentTime;
      if (diff < 0) {
        diff += 24 * 60; // Next day
      }
      
      if (diff < minDiff) {
        minDiff = diff;
        nextTimeSlot = timeSlot;
      }
    }

    return nextTimeSlot ? { timeSlot: nextTimeSlot, isCurrent: false } : null;
  };

  const currentOrNext = getCurrentOrNextOccurrence();
  const currentOrNextOccurrence = currentOrNext?.timeSlot || null;
  const isCurrentEvent = currentOrNext?.isCurrent || false;

  const formatTimeUntil = (startTime: string, endTime: string) => {
    const localNow = getLocalTime();
    const currentTime = localNow.totalMinutes;

    const startTimeMinutes = convertToLocalMinutes(startTime);
    const endTimeMinutes = convertToLocalMinutes(endTime);
    
    // Check if currently happening
    if (startTimeMinutes <= endTimeMinutes) {
      // Same day event
      if (currentTime >= startTimeMinutes && currentTime < endTimeMinutes) {
        return 'Now';
      }
    } else {
      // Overnight event
      if (currentTime >= startTimeMinutes || currentTime < endTimeMinutes) {
        return 'Now';
      }
    }
    
    // Calculate time until start
    let diff = startTimeMinutes - currentTime;
    if (diff < 0) {
      diff += 24 * 60; // Next day
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0 && minutes === 0) {
      return 'Now';
    }
    if (hours === 0) {
      return `in ${minutes}m`;
    }
    return `in ${hours}h ${minutes}m`;
  };

  // Calculate hours until event starts
  const getHoursUntil = (startTime: string) => {
    const localNow = getLocalTime();
    const currentTime = localNow.totalMinutes;
    const startTimeMinutes = convertToLocalMinutes(startTime);
    
    let diff = startTimeMinutes - currentTime;
    if (diff < 0) {
      diff += 24 * 60; // Next day
    }
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours === 0 && minutes === 0) {
      return 'Now';
    }
    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h`;
  };

  // Filter out current occurrence and past events from the list
  // Keep next occurrence in the list if it hasn't started yet
  const filteredTimeSlots = Object.values(timeSlotsByTime).filter((timeSlot) => {
    // Only filter out if it's the CURRENT occurrence (happening now)
    // Keep the next occurrence in the list if it hasn't started
    if (isCurrentEvent && currentOrNextOccurrence && 
        timeSlot.start === currentOrNextOccurrence.start && 
        timeSlot.end === currentOrNextOccurrence.end) {
      return false;
    }

    // Don't show if it's in the past (already ended today)
    const localNow = getLocalTime();
    const currentTime = localNow.totalMinutes;

    const endTime = convertToLocalMinutes(timeSlot.end);

    // If end time is before current time (and it's a same-day event), it's past
    if (endTime < currentTime) {
      // Check if it's a same-day event (start < end)
      const startTime = convertToLocalMinutes(timeSlot.start);
      if (startTime < endTime) {
        return false; // Past event
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-lg font-light text-gray-400">Loading event timers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-lg font-light text-red-400">Error: {error}</div>
      </div>
    );
  }


  // Get map image URL - maps are in the /ui/ folder
  const getMapImageUrl = (mapName: string) => {
    const mapSlug = mapName.toLowerCase().replace(/\s+/g, '-');
    return `https://cdn.metaforge.app/arc-raiders/ui/${mapSlug}.webp`;
  };

  const harvesterBgImage = 'https://cdn.metaforge.app/arc-raiders/custom/harvester.webp';

  return (
    <div className="min-h-screen p-8 pb-20 bg-gray-950">
      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <img
            src="/Logo.webp"
            alt="ARC Raiders Logo"
            className="w-24 h-24 object-contain mb-4"
          />
          <h1 className="text-4xl font-light text-center text-gray-100">
            Harvester Event Times
          </h1>
        </div>
        
        {harvesterEvents.length === 0 && !loading ? (
          <div className="text-center text-lg font-light text-gray-400">
            No Harvester events found.
          </div>
        ) : (
          <>
            {currentOrNextOccurrence && (
              <div className="mb-8 p-5 bg-blue-950/30 rounded-xl border border-blue-800/50 shadow-sm relative flex items-center gap-4">
                <img
                  src={harvesterBgImage}
                  alt="Harvester"
                  className="w-12 h-12 object-contain opacity-80 shrink-0"
                />
                <div className="flex-1 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-light text-gray-400 mb-2 uppercase tracking-wide">
                      {isCurrentEvent ? 'Current occurrence:' : 'Next occurrence:'}
                    </div>
                    <div className="text-2xl font-light text-blue-300">
                      {formatTimeLocal(currentOrNextOccurrence.start)} - {formatTimeLocal(currentOrNextOccurrence.end)}
                      <span className="text-lg ml-2 text-blue-400">
                        ({formatTimeUntil(currentOrNextOccurrence.start, currentOrNextOccurrence.end)})
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {currentOrNextOccurrence.maps.map((mapInfo, idx) => {
                      const mapImageUrl = getMapImageUrl(mapInfo.map);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/40 rounded-md text-sm font-light text-blue-300 backdrop-blur-sm"
                        >
                          {mapImageUrl && (
                            <img
                              src={mapImageUrl}
                              alt={mapInfo.map}
                              className="w-5 h-5 rounded-full object-cover opacity-90"
                            />
                          )}
                          {mapInfo.icon && !mapImageUrl && (
                            <img
                              src={mapInfo.icon}
                              alt={mapInfo.map}
                              className="w-5 h-5 rounded-full object-cover opacity-90"
                            />
                          )}
                          <span>{mapInfo.map}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {currentOrNextOccurrence && <hr className="mb-8 border-gray-800" />}

            {filteredTimeSlots.length > 0 && (
              <h2 className="text-2xl font-light mb-4 text-gray-100">Upcoming events</h2>
            )}

            <div className="space-y-2.5">
              {filteredTimeSlots.map((timeSlot, index) => {
                return (
                  <div
                    key={`${timeSlot.start}-${timeSlot.end}-${index}`}
                    className="p-4 rounded-lg border border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:shadow-sm transition-all flex items-center gap-4"
                  >
                    <img
                      src={harvesterBgImage}
                      alt="Harvester"
                      className="w-10 h-10 object-contain opacity-80 shrink-0"
                    />
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-lg font-light text-gray-100">
                          {formatTimeLocal(timeSlot.start)} - {formatTimeLocal(timeSlot.end)}
                        </div>
                        <div className="text-sm font-light text-gray-400 mt-1">
                          in {getHoursUntil(timeSlot.start)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        {timeSlot.maps.map((mapInfo, mapIdx) => {
                          const mapImageUrl = getMapImageUrl(mapInfo.map);
                          return (
                            <div
                              key={mapIdx}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 rounded-lg border border-gray-700 backdrop-blur-sm group"
                            >
                              {mapImageUrl && (
                                <img
                                  src={mapImageUrl}
                                  alt={mapInfo.map}
                                  className="w-5 h-5 rounded-full object-cover opacity-90"
                                />
                              )}
                              {mapInfo.icon && !mapImageUrl && (
                                <img
                                  src={mapInfo.icon}
                                  alt={mapInfo.map}
                                  className="w-5 h-5 rounded-full object-cover opacity-90"
                                />
                              )}
                              <span className="font-light text-sm text-gray-300">
                                {mapInfo.map}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-12 text-center text-sm font-light text-gray-500">
          <p>
            Data provided by{' '}
            <a
              href="https://metaforge.app/arc-raiders"
            target="_blank"
            rel="noopener noreferrer"
              className="underline hover:text-gray-400 transition-colors"
          >
              MetaForge
          </a>
          </p>
        </div>
      </main>
    </div>
  );
}
