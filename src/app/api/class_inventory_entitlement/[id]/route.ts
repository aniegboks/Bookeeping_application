// app/api/class_inventory_entitlements/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://inventory-backend-hm7r.onrender.com/api/v1/class_inventory_entitlements";

/**
 * Context type for route parameters
 * In Next.js 15, params is a Promise
 */
interface Context {
  params: Promise<{ id: string }>;
}

// GET /api/class_inventory_entitlements/[id]
export async function GET(req: NextRequest, { params }: Context) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error fetching class inventory entitlement by ID:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/class_inventory_entitlements/[id]
export async function PUT(req: NextRequest, { params }: Context) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Error updating class inventory entitlement:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/class_inventory_entitlements/[id]
export async function DELETE(req: NextRequest, { params }: Context) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    // If backend returns 204 No Content, convert to 200 with JSON
    if (res.status === 204) {
      return NextResponse.json(
        { success: true, message: "Deleted" },
        { status: 200 }
      );
    }

    // For other status codes, try to get response data
    if (res.ok) {
      try {
        const data = await res.json();
        return NextResponse.json({ success: true, ...data }, { status: 200 });
      } catch {
        return NextResponse.json(
          { success: true, message: "Deleted" },
          { status: 200 }
        );
      }
    }

    // Handle error responses
    const errorData = await res.json().catch(() => ({ error: "Delete failed" }));
    return NextResponse.json(errorData, { status: res.status });
  } catch (err) {
    console.error("Error deleting class inventory entitlement:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}