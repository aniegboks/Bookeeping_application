// app/api/class_inventory_entitlements/[id]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { classInventoryEntitlementsApi } from "@/lib/class_inventory_entitlement";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const response = await classInventoryEntitlementsApi.getClassInventoryEntitlementById(id, token);
  if (response.error) return NextResponse.json({ error: response.error }, { status: response.status });
  return NextResponse.json(response.data);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const response = await classInventoryEntitlementsApi.updateClassInventoryEntitlement(id, body, token);

  if (response.error) return NextResponse.json({ error: response.error }, { status: response.status });
  return NextResponse.json(response.data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const response = await classInventoryEntitlementsApi.deleteClassInventoryEntitlement(id, token);
  if (response.error) return NextResponse.json({ error: response.error }, { status: response.status });
  return NextResponse.json({ success: true });
}