// src/app/api/inventory_item_api/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL?.replace(/\/$/, "") || "https://inventory-backend-hm7r.onrender.com";

function forwardHeaders(req: NextRequest) {
  const headers: Record<string, string> = {};
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;

  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  return headers;
}

async function makeResponse(proxyRes: Response) {
  const text = await proxyRes.text();
  const headers: Record<string, string> = {};
  const contentType = proxyRes.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  return new NextResponse(text, { status: proxyRes.status, headers });
}

// GET single inventory item
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${BACKEND}/api/v1/inventory_items/${params.id}`;
  try {
    const res = await fetch(url, { method: "GET", headers: forwardHeaders(req) });
    return await makeResponse(res);
  } catch (err: any) {
    return NextResponse.json({ message: "Proxy GET failed", error: String(err) }, { status: 502 });
  }
}

// PUT update inventory item
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${BACKEND}/api/v1/inventory_items/${params.id}`;
  try {
    const body = await req.text();
    const res = await fetch(url, { method: "PUT", headers: forwardHeaders(req), body });
    return await makeResponse(res);
  } catch (err: any) {
    return NextResponse.json({ message: "Proxy PUT failed", error: String(err) }, { status: 502 });
  }
}

// DELETE inventory item
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const url = `${BACKEND}/api/v1/inventory_items/${params.id}`;
  try {
    const res = await fetch(url, { method: "DELETE", headers: forwardHeaders(req) });
    return await makeResponse(res);
  } catch (err: any) {
    return NextResponse.json({ message: "Proxy DELETE failed", error: String(err) }, { status: 502 });
  }
}
