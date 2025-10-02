// app/api/proxies/[...path]/route.ts

import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = 'https://inventory-backend-hm7r.onrender.com/api/v1';

/**
 * Context type for catch-all route parameters
 * In Next.js 15, params is a Promise
 */
interface Context {
    params: Promise<{ path: string[] }>;
}

export async function routeHandler(request: NextRequest, context: Context) {
    const token = request.cookies.get("token")?.value;

    // 1. Authentication Check (401)
    if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // 2. Await params before accessing path
    const { path } = await context.params;

    // 3. Build URL
    const requestedPath = path.join('/');
    // Append query parameters from the Next.js request
    const fullBackendUrl = `${BACKEND_BASE_URL}/${requestedPath}${request.nextUrl.search}`;

    // 4. Build Headers
    const headers = new Headers(request.headers);
    // CRITICAL: Set the Authorization header with the HttpOnly token
    headers.set('Authorization', `Bearer ${token}`);

    // Clean up headers that shouldn't be forwarded to an external API
    headers.delete('host');
    headers.delete('content-length'); // Often necessary to delete Content-Length when streaming

    // 5. Handle Body (Pass through the original body stream)
    let body: ReadableStream | null = null;
    // Only pass the body for methods that expect one
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
        body = request.body;
    }

    try {
        const fetchOptions: RequestInit = {
            method: request.method,
            headers: headers,
            body: body,
            // Prevent Next.js from caching the proxy response
            cache: 'no-store',
        };

        // FIX FOR TypeError: RequestInit: duplex option is required when sending a body.
        if (body) {
            (fetchOptions as any).duplex = 'half';
        }

        const backendRes = await fetch(fullBackendUrl, fetchOptions);

        // 6. Handle Backend Error Responses
        if (!backendRes.ok) {
            // Read the raw error response body
            const backendErrorText = await backendRes.text();

            console.error(`PROXY ERROR: Backend returned ${backendRes.status} for ${request.method} ${requestedPath}`);
            console.error("Backend Error Details:", backendErrorText);

            // Forward the backend's status and response body verbatim
            return new NextResponse(backendErrorText, {
                status: backendRes.status,
                headers: {
                    'Content-Type': backendRes.headers.get('Content-Type') || 'application/json',
                },
            });
        }

        // 7. Handle Successful Responses
        if (request.method === 'DELETE' && backendRes.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        const responseBody = await backendRes.json().catch(() => ({}));

        return NextResponse.json(responseBody, {
            status: backendRes.status,
        });

    } catch (error) {
        console.error("CRITICAL PROXY FAILURE (Network/Handler Crash):", error);
        // The 500 you were seeing previously is likely this line being executed after the TypeError.
        return NextResponse.json({ error: "Failed to connect to external service" }, { status: 500 });
    }
}

export const GET = routeHandler;
export const POST = routeHandler;
export const PUT = routeHandler;
export const DELETE = routeHandler;
export const PATCH = routeHandler;