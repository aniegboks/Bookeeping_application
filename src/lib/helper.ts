// src/lib/helper.ts

// Custom error class to carry status code and data
export class ApiError extends Error {
    constructor(message: string, public status: number, public data: any) {
        super(message);
        this.name = 'ApiError';
        // Ensure ApiError is caught as an instance of this class
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

// NOTE: The client side error trace showed /api/proxy/suppliers. 
// Your Next.js proxy route is app/api/proxies/[...path]/route.ts.
// We assume the URL here is relative to the client host and hits the Next.js proxy.
const API_PROXY_PREFIX = '/api/proxy/'; 

export const apiRequest = async <T>(
    endpoint: string, 
    options: RequestInit = {}
): Promise<T> => {
    const url = `${API_PROXY_PREFIX}${endpoint}`; 

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            } as HeadersInit,
        });

        // If the response is not OK (status 4xx or 5xx)
        if (!response.ok) {
            let errorData: any = {};
            const contentType = response.headers.get('content-type');
            
            // Try to read JSON body if available
            if (contentType?.includes('application/json')) {
                errorData = await response.json().catch(() => ({}));
            } else {
                errorData.message = await response.text();
            }

            // Line 54: Throw the custom error with status and message
            throw new ApiError(
                errorData.error || errorData.message || `API request failed with status ${response.status}`,
                response.status,
                errorData
            );
        }

        // Handle successful response (204 No Content for DELETE)
        if (response.status === 204 || response.status === 201 && response.headers.get('content-length') === '0') {
            return undefined as unknown as T;
        }
        
        // Return parsed JSON data
        return response.json() as Promise<T>;
        
    } catch (error) {
        // Re-throw if it's already an ApiError (from the block above)
        if (error instanceof ApiError) {
            throw error; 
        }
        // Handle network errors (e.g., DNS failure, CORS block)
        console.error("Network Error:", error);
        throw new Error(`A network or unexpected error occurred: ${(error as Error).message}`);
    }
};