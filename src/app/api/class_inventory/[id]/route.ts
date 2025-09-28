import { NextResponse, NextRequest } from "next/server";
import { updateEntitlement, deleteEntitlement } from "@/lib/class_inventory";

interface Params {
  params: { id: string };
}

// PUT /api/entitlements/:id
export async function PUT(request: NextRequest, { params }: Params) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = await updateEntitlement(params.id, body, token);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/entitlements/:id
export async function DELETE(request: NextRequest, { params }: Params) {
  const token = request.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await deleteEntitlement(params.id, token);
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
