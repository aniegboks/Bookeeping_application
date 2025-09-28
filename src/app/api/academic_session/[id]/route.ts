// app/api/academic-sessions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { academicSessionsApi } from "@/lib/academic_session";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const data = await academicSessionsApi.getById(params.id, token);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Academic session fetch error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const data = await academicSessionsApi.update(params.id, body, token);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Academic session update error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await academicSessionsApi.delete(params.id, token);
        return NextResponse.json({ message: "Academic session deleted successfully" });
    } catch (error: any) {
        console.error("Academic session deletion error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}