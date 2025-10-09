import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.BACKEND_API_URL ||
  "https://inventory-backend-hm7r.onrender.com/api/v1/student_inventory_collection/bulk_upsert";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Optional validation (good practice for bulk endpoints)
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Request body must be an array of student inventory collections" },
        { status: 400 }
      );
    }

    if (body.length === 0) {
      return NextResponse.json(
        { error: "Request body cannot be empty" },
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

    const data = await res.json().catch(() => null);

    return NextResponse.json(data || {}, { status: res.status });
  } catch (err) {
    console.error("Error bulk upserting student inventory collection:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
