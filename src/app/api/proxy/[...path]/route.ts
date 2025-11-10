// app/api/proxies/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = 'https://inventory-backend-hm7r.onrender.com/api/v1';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_TOTAL_WAIT_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

interface Context {
    params: Promise<{ path: string[] }>;
}

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(
    url: string, 
    options: RequestInit, 
    requestedPath: string,
    method: string
): Promise<Response> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            // Check if we've exceeded total wait time
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > MAX_TOTAL_WAIT_TIME) {
                console.error(`Max wait time (1 hour) exceeded for ${method} ${requestedPath}`);
                throw new Error('Request timeout: Backend took too long to wake up (>1 hour)');
            }

            const response = await fetch(url, options);
            
            // If 502 or 503 (backend hibernating), retry
            if ((response.status === 502 || response.status === 503) && attempt < MAX_RETRIES - 1) {
                // Exponential backoff: 2s, 4s, 8s, 16s, 32s
                const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), 32000);
                console.log(
                    `🔄 Backend hibernating (${response.status}) - ` +
                    `Retry ${attempt + 1}/${MAX_RETRIES} in ${delay/1000}s for ${method} ${requestedPath}`
                );
                await sleep(delay);
                continue;
            }
            
            // If we got here and it's not 502/503, return the response
            if (attempt > 0 && response.ok) {
                console.log(`✅ Backend awake! ${method} ${requestedPath} succeeded after ${attempt + 1} attempts`);
            }
            
            return response;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            // If this is the last attempt, throw
            if (attempt === MAX_RETRIES - 1) {
                console.error(`❌ All retries exhausted for ${method} ${requestedPath}`);
                throw lastError;
            }
            
            // Otherwise, retry with exponential backoff
            const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), 32000);
            console.log(
                `⚠️ Request failed - Retry ${attempt + 1}/${MAX_RETRIES} in ${delay/1000}s for ${method} ${requestedPath}`,
                lastError.message
            );
            await sleep(delay);
        }
    }
    
    throw lastError || new Error('Max retries exceeded');
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

        // 6. Perform fetch with retry logic
        const backendRes = await fetchWithRetry(
            fullBackendUrl, 
            fetchOptions,
            requestedPath,
            request.method
        );

        // 7. Handle DELETE 204 (no content)
        if (request.method === 'DELETE' && backendRes.status === 204) {
            return new NextResponse(null, { status: 204 });
        }

        // 8. Read the response body ONCE - this is critical!
        const responseText = await backendRes.text();

        // 9. Handle backend errors
        if (!backendRes.ok) {
            console.error(`PROXY ERROR: ${backendRes.status} ${request.method} ${requestedPath}`);
            console.error("Backend Error:", responseText);

            return new NextResponse(responseText, {
                status: backendRes.status,
                headers: {
                    'Content-Type': backendRes.headers.get('Content-Type') || 'application/json',
                },
            });
        }

        // 10. Parse JSON safely (from the text we already read)
        let responseBody: unknown = {};
        try {
            responseBody = JSON.parse(responseText);
        } catch {
            // If it's not JSON, return the text as-is
            return new NextResponse(responseText, {
                status: backendRes.status,
                headers: {
                    'Content-Type': backendRes.headers.get('Content-Type') || 'text/plain',
                },
            });
        }

        return NextResponse.json(responseBody, { status: backendRes.status });

    } catch (error) {
        console.error("CRITICAL PROXY FAILURE:", error);
        return NextResponse.json({ 
            error: "Failed to connect to external service",
            details: error instanceof Error ? error.message : "Unknown error",
            hint: "Backend may be hibernating. Please wait 30-60 seconds and try again."
        }, { status: 500 });
    }
}

// Export all HTTP methods (these are the only valid exports for Next.js routes)
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;