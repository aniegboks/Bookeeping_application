// app/api/suppliers/route.ts

import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://inventory-backend-hm7r.onrender.com';
const API_VERSION = 'v1';
const SUPPLIERS_ENDPOINT = `${EXTERNAL_API_BASE_URL}/api/${API_VERSION}/suppliers`;

const getAuthToken = (request: NextRequest): string | undefined => {
    return request.cookies.get("token")?.value;
};

// GET: Fetch all suppliers
export async function GET(request: NextRequest) {
    const token = getAuthToken(request);

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const backendRes = await fetch(SUPPLIERS_ENDPOINT, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
        });

        if (!backendRes.ok) {
            // Forward the backend error response and status
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(errorData, { status: backendRes.status });
        }

        return NextResponse.json(await backendRes.json());
    } catch (error) {
        console.error("GET Suppliers proxy fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new supplier
export async function POST(request: NextRequest) {
    const token = getAuthToken(request);
    const payload = await request.json();

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const backendRes = await fetch(SUPPLIERS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(errorData, { status: backendRes.status });
        }

        return NextResponse.json(await backendRes.json(), { status: 201 }); // 201 Created
    } catch (error) {
        console.error("POST Supplier proxy fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}