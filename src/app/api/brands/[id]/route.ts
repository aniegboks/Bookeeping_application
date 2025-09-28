import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.API_BASE_URL + "/brands";

// GET /api/brands/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BASE_URL}/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return NextResponse.json({ error: "Brand not found" }, { status: res.status });
  return NextResponse.json(await res.json());
}

// PUT /api/brands/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${BASE_URL}/${params.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    return NextResponse.json({ error: errorData?.message || "Failed to update brand" }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}

// DELETE /api/brands/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BASE_URL}/${params.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });

  if (!res.ok) return NextResponse.json({ error: "Failed to delete brand" }, { status: res.status });
  return NextResponse.json({ message: "Brand deleted successfully" });
}