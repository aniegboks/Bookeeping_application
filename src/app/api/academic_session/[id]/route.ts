import { NextRequest, NextResponse } from "next/server";
import { academicSessionsApi } from "@/lib/academic_session";
import { CreateAcademicSessionData } from "@/lib/types/academic_session";

// Helper to extract error messages
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Internal server error";
}

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const data = await academicSessionsApi.getById(id, token);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Academic session fetch error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body: Partial<CreateAcademicSessionData> = await request.json();
    const data = await academicSessionsApi.update(id, body, token);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Academic session update error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await academicSessionsApi.delete(id, token);
    return NextResponse.json({ message: "Academic session deleted successfully" });
  } catch (error: unknown) {
    console.error("Academic session deletion error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}