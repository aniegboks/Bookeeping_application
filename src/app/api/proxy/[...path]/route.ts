// app/api/proxies/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = 'https://inventory-backend-hm7r.onrender.com/api/v1';

interface Context {
    params: Promise<{ path: string[] }>;
}

async function handleRequest(request: NextRequest, context: Context) {
    try {
        const token = request.cookies.get("token")?.value;

        // 1. Authentication check
        if (!token) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // 2. Await params
        const { path } = await context.params;

        // 3. Build full URL
        const requestedPath = path.join('/');
        const fullBackendUrl = `${BACKEND_BASE_URL}/${requestedPath}${request.nextUrl.search}`;

        // 4. Build headers
        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${token}`);
        headers.delete('host');
        headers.delete('content-length');

        // 5. Handle body
        let body: ReadableStream | null = null;
        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
            body = request.body;
        }

        const fetchOptions: RequestInit & { duplex?: "half" } = {
            method: request.method,
            headers,
            body,
            cache: 'no-store',
        };

        if (body) fetchOptions.duplex = 'half';

        // 6. Perform fetch
        const backendRes = await fetch(fullBackendUrl, fetchOptions);

        // 7. Handle backend errors
        if (!backendRes.ok) {
            const backendErrorText = await backendRes.text();
            console.error(`PROXY ERROR: ${backendRes.status} ${request.method} ${requestedPath}`);
            console.error("Backend Error:", backendErrorText);

            return new NextResponse(backendErrorText, {
                status: backendRes.status,
                headers: {
                    'Content-Type': backendRes.headers.get('Content-Type') || 'application/json',
                },
            });
        }

        // 8. Handle DELETE 204
        if (request.method === 'DELETE' && backendRes.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        // 9. Parse JSON safely
        let responseBody: unknown = {};
        try {
            responseBody = await backendRes.json();
        } catch {
            responseBody = {};
        }

        return NextResponse.json(responseBody, { status: backendRes.status });

    } catch (error) {
        console.error("CRITICAL PROXY FAILURE:", error);
        return NextResponse.json({ error: "Failed to connect to external service" }, { status: 500 });
    }
}

// Export all HTTP methods (these are the only valid exports for Next.js routes)
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;