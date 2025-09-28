import { NextResponse, NextRequest } from "next/server";
import { getEntitlements, createEntitlement } from "@/lib/class_inventory";

export async function GET(request: NextRequest) {  // ✅ use NextRequest
  const token = request.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(request.url);
    const filters: Record<string, string> = {};
    url.searchParams.forEach((value, key) => (filters[key] = value));

    const data = await getEntitlements(token, filters);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {  // ✅ use NextRequest
  const token = request.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = await createEntitlement(body, token);
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
