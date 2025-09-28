import { NextRequest, NextResponse } from "next/server";
import { academicSessionsApi } from "@/lib/academic_session";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await academicSessionsApi.getAll(token);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Academic sessions fetch error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const data = await academicSessionsApi.create(body, token);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Academic session creation error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
