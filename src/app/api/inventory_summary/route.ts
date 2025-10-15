import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://inventory-backend-hm7r.onrender.com";

/**
 * GET /api/proxy/inventory_summary/low-stock
 * Get all low stock inventory items
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Check if this is a low-stock request
  if (request.url.includes('/low-stock')) {
    return handleLowStock(request);
  }

  return NextResponse.json(
    { message: "Method not supported for this route" },
    { status: 405 }
  );
}

/**
 * POST /api/proxy/inventory_summary/bulk
 * Get inventory summaries for multiple items
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const inventoryIds = await request.json();

    if (!Array.isArray(inventoryIds)) {
      return NextResponse.json(
        { message: "Invalid request body. Expected an array of inventory IDs" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/inventory_summary/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(inventoryIds),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch bulk inventory summaries" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bulk inventory summaries:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleLowStock(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/inventory_summary/low-stock`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch low stock items" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}