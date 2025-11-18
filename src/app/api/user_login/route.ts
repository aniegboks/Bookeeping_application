import { NextRequest, NextResponse } from "next/server";

const TEST_URL = process.env.BOOK_KEEPING_TEST_URL!;

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const verify = await fetch(TEST_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!verify.ok) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const data = await verify.json();
    
    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}