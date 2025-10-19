import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/inventory_transactions/distributions`;

/**
 * GET /api/proxy/inventory_transactions/distributions/[id]
 * Fetch a specific inventory distribution by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    const res = await fetch(`${API_BASE_URL}/${id}`, {
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
        { message: errorText || "Failed to fetch inventory distribution" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Proxy GET [id] error:", err);
    return NextResponse.json(
      { message: "Failed to fetch inventory distribution" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/proxy/inventory_transactions/distributions/[id]
 * Update an inventory distribution by ID
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
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

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Proxy PUT [id] error:", err);
    return NextResponse.json(
      { message: "Failed to update inventory distribution" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/proxy/inventory_transactions/distributions/[id]
 * Delete an inventory distribution by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: req.headers.get("authorization") || "",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { message: errorText || "Failed to delete inventory distribution" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: "Inventory distribution deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Proxy DELETE [id] error:", err);
    return NextResponse.json(
      { message: "Failed to delete inventory distribution" },
      { status: 500 }
    );
  }
}