import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/inventory_transactions/distributions`;

/**
 * GET /api/proxy/inventory_transactions/distributions
 * Fetch all inventory distributions (with optional filters)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    const url = queryString
      ? `${API_BASE_URL}/query?${queryString}`
      : `${API_BASE_URL}/query`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { message: errorText || "Failed to fetch inventory distributions" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Proxy GET error:", err);
    return NextResponse.json(
      { message: "Failed to fetch inventory distributions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/proxy/inventory_transactions/distributions
 * Create (distribute) inventory items to a class
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Proxy POST error:", err);
    return NextResponse.json(
      { message: "Failed to create inventory distribution" },
      { status: 500 }
    );
  }
}
