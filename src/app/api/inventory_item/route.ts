import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://inventory-backend-hm7r.onrender.com/api/v1/inventory_items';

/**
 * GET /api/inventory_items
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = url.search; // preserve filters
    console.log('GET request URL:', req.url);
    console.log('Forwarding query to backend:', query);

    const res = await fetch(`${BASE_URL}${query}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Backend response status:', res.status);

    const data = await res.json();
    console.log('Backend response data:', data);

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Failed to fetch inventory items' }, { status: 500 });
  }
}

/**
 * POST /api/inventory_items
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('POST request body:', body);

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', res.status);

    const data = await res.json();
    console.log('Backend response data:', data);

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ message: 'Failed to create inventory item' }, { status: 500 });
  }
}
