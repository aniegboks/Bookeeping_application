// app/api/class_inventory_entitlements/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { classInventoryEntitlementsApi } from "@/lib/class_inventory_entitlement";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filters = {
    class_id: searchParams.get("class_id") || undefined,
    inventory_item_id: searchParams.get("inventory_item_id") || undefined,
    session_term_id: searchParams.get("session_term_id") || undefined,
  };

  const response = await classInventoryEntitlementsApi.getAllClassInventoryEntitlements(filters, token);

  if (response.error) return NextResponse.json({ error: response.error }, { status: response.status });
  return NextResponse.json(response.data);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const response = await classInventoryEntitlementsApi.createClassInventoryEntitlement(body, token);

  if (response.error) return NextResponse.json({ error: response.error }, { status: response.status });
  return NextResponse.json(response.data, { status: 201 });
}
