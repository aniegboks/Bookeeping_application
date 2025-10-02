// src\app\api\academic_session\[id]\route.ts

import { NextRequest, NextResponse } from "next/server";
import { academicSessionsApi, ApiError } from "@/lib/academic_session";
import { CreateAcademicSessionData } from "@/lib/types/academic_session";

// Helper to extract error messages, accommodating the custom ApiError
function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }
    return error instanceof Error ? error.message : "Internal server error";
}

// ---------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------

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
        // Handle custom API errors (e.g., 404 Not Found) if ApiError contains the status
        if (error instanceof ApiError) {
            return NextResponse.json({ error: getErrorMessage(error) }, { status: error.status });
        }
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

// ---------------------------------------------------------------------
// PUT
// ---------------------------------------------------------------------

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
        if (error instanceof ApiError) {
            return NextResponse.json({ error: getErrorMessage(error) }, { status: error.status });
        }
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}

// ---------------------------------------------------------------------
// DELETE (FIXED)
// ---------------------------------------------------------------------

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await academicSessionsApi.delete(id, token);
        
        // 🚀 FIX: Return 204 No Content for successful deletion.
        // This is the standard HTTP response when a resource is deleted and no body is returned.
        return new NextResponse(null, { status: 204 }); 

    } catch (error: unknown) {
        console.error("Academic session deletion error:", error);
        if (error instanceof ApiError) {
            // If the upstream API failed with a 404, propagate that status
            return NextResponse.json({ error: getErrorMessage(error) }, { status: error.status });
        }
        return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
    }
}