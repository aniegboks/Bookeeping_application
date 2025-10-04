import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://inventory-backend-hm7r.onrender.com";
const API_VERSION = "v1";

// Helper to get token from cookies
const getAuthToken = (request: NextRequest): string | undefined => {
  return request.cookies.get("token")?.value;
};

// Define the correct Next.js 15 route context type
interface RouteContext {
  params: Promise<{ id: string }>;
}

// =========================
// GET: Fetch supplier by ID
// =========================
export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const token = getAuthToken(request);
  const url = `${EXTERNAL_API_BASE_URL}/api/${API_VERSION}/suppliers/${id}`;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error(`GET Supplier (${id}) proxy fetch error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ==========================
// PUT: Update supplier by ID
// ==========================
export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const token = getAuthToken(request);
  const url = `${EXTERNAL_API_BASE_URL}/api/${API_VERSION}/suppliers/${id}`;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();

  try {
    const backendRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await backendRes.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error(`PUT Supplier (${id}) proxy fetch error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ============================
// DELETE: Delete supplier by ID
// ============================
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const token = getAuthToken(request);
  const url = `${EXTERNAL_API_BASE_URL}/api/${API_VERSION}/suppliers/${id}`;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: backendRes.status });
    }

    // Return 204 No Content on success
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE Supplier (${id}) proxy fetch error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
