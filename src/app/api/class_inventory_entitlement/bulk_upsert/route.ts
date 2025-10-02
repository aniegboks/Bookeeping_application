// app/api/class_inventory_entitlements/bulk_upsert/route.ts

import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://inventory-backend-hm7r.onrender.com/api/v1/class_inventory_entitlements/bulk_upsert";

// POST /api/class_inventory_entitlements/bulk_upsert
export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Validate that body is an array
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array" },
        { status: 400 }
      );
    }

    const res = await fetch(BASE_URL, {
      method: "POST",
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
    console.error("Error bulk upserting class inventory entitlements:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}