import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const book_keeping_auth_url = process.env.BOOK_KEEPING_AUTH_URL;
  if (!book_keeping_auth_url) {
    return NextResponse.json({ error: "Auth URL not configured" }, { status: 500 });
  }

  const { email, password } = await req.json();

  const backendRes = await fetch(book_keeping_auth_url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const data = await backendRes.json();

  const res = NextResponse.json({ success: true, user: data.user });
  res.cookies.set("token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
