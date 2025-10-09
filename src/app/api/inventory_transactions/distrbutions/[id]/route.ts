// app/api/inventory_transactions/distributions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://inventory-backend-hm7r.onrender.com/api/v1/inventory_transactions/distributions";

/**
 * Context type for route parameters
 * In Next.js 15, params is a Promise
 */
interface Context {
  params: Promise<{ id: string }>;
}

// PUT /api/inventory_transactions/distributions/[id]
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
    console.error("Error updating inventory distribution:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}