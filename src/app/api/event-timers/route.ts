import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const map = searchParams.get('map');
    const name = searchParams.get('name');

    // Build the API URL with optional query parameters
    let apiUrl = 'https://metaforge.app/api/arc-raiders/event-timers';
    const params = new URLSearchParams();
    if (map) params.append('map', map);
    if (name) params.append('name', name);
    if (params.toString()) {
      apiUrl += '?' + params.toString();
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching event timers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event timers' },
      { status: 500 }
    );
  }
}

