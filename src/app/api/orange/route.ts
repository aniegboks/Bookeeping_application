// src/app/api/inventory_item_api/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL?.replace(/\/$/, "") || "https://inventory-backend-hm7r.onrender.com";

// Forward headers including Authorization and Content-Type
function forwardHeaders(req: NextRequest) {
  const headers: Record<string, string> = {};
  const auth = req.headers.get("authorization"); // capture Bearer token from frontend
  if (auth) headers["authorization"] = auth;

  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  return headers;
}

// Convert backend Response to NextResponse
async function makeResponse(proxyRes: Response) {
  const text = await proxyRes.text();
  const headers: Record<string, string> = {};
  const contentType = proxyRes.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  return new NextResponse(text, { status: proxyRes.status, headers });
}

// GET all inventory items
export async function GET(req: NextRequest) {
  const url = `${BACKEND}/api/v1/inventory_items${req.nextUrl.search ?? ""}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: forwardHeaders(req),
    });
    return await makeResponse(res);
  } catch (err: any) {
    return NextResponse.json({ message: "Proxy GET failed", error: String(err) }, { status: 502 });
  }
}

// POST new inventory item
export async function POST(req: NextRequest) {
  const url = `${BACKEND}/api/v1/inventory_items`;
  try {
    const body = await req.text();
    const res = await fetch(url, {
      method: "POST",
      headers: forwardHeaders(req),
      body,
    });
    return await makeResponse(res);
  } catch (err: any) {
    return NextResponse.json({ message: "Proxy POST failed", error: String(err) }, { status: 502 });
  }
}
