// app/api/suppliers/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://inventory-backend-hm7r.onrender.com';
const API_VERSION = 'v1';

const getAuthToken = (request: NextRequest): string | undefined => {
    return request.cookies.get("token")?.value;
};

// Define the type for the Next.js route segment parameters
interface RouteParams {
    params: {
        id: string;
    };
}

// GET: Fetch supplier by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
    const token = getAuthToken(request);
    const supplierId = params.id;
    const url = `${EXTERNAL_API_BASE_URL}/api/${API_VERSION}/suppliers/${supplierId}`;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const backendRes = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(errorData, { status: backendRes.status });
        }

        return NextResponse.json(await backendRes.json());
    } catch (error) {
        console.error(`GET Supplier (${supplierId}) proxy fetch error:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


// PUT: Update supplier by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const token = getAuthToken(request);
    const supplierId = params.id;
    const payload = await request.json();
    const url = `${EXTERNAL_API_BASE_URL}/api/${API_VERSION}/suppliers/${supplierId}`;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const backendRes = await fetch(url, {
            method: 'PUT',
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

        return NextResponse.json(await backendRes.json());
    } catch (error) {
        console.error(`PUT Supplier (${supplierId}) proxy fetch error:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


// DELETE: Delete supplier by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const token = getAuthToken(request);
    const supplierId = params.id;
    const url = `${EXTERNAL_API_BASE_URL}/api/${API_VERSION}/suppliers/${supplierId}`;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const backendRes = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(errorData, { status: backendRes.status });
        }

        // Return a 204 No Content response for successful deletion
        return new NextResponse(null, { status: 204 }); 
    } catch (error) {
        console.error(`DELETE Supplier (${supplierId}) proxy fetch error:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}