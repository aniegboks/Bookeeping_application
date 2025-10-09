// src/lib/helper.ts

// Custom error class to carry status code and data
export class ApiError<T = unknown> extends Error {
    constructor(
        message: string,
        public status: number,
        public data: T
    ) {
        super(message);
        this.name = 'ApiError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

// API proxy prefix
const API_PROXY_PREFIX = '/api/proxy/';

/**
 * Type guard to check if an object has an "error" property of type string
 */
function hasErrorProperty(obj: unknown): obj is { error: string } {
    return typeof obj === 'object' && obj !== null && 'error' in obj && typeof (obj as { error: unknown }).error === 'string';
}

/**
 * Makes a typed API request via the Next.js proxy.
 * @param endpoint - API endpoint relative to /api/proxy/
 * @param options - fetch options
 * @returns A promise of type T
 */
export const apiRequest = async <T = unknown, E = unknown>(
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

        // Handle non-OK responses
        if (!response.ok) {
            let errorData: E | { message: string } = { message: '' };
            const contentType = response.headers.get('content-type');

            if (contentType?.includes('application/json')) {
                errorData = await response.json().catch(() => ({ message: '' }));
            } else {
                errorData = { message: await response.text() };
            }

            const message = hasErrorProperty(errorData)
                ? errorData.error
                : 'message' in (errorData as object) && typeof (errorData as { message: unknown }).message === 'string'
                    ? (errorData as { message: string }).message
                    : `API request failed with status ${response.status}`;

            throw new ApiError<E | { message: string }>(message, response.status, errorData);
        }

        // Handle successful responses with no content
        if (response.status === 204 || (response.status === 201 && response.headers.get('content-length') === '0')) {
            return undefined as unknown as T;
        }

        // Parse JSON response
        return response.json() as Promise<T>;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error("Network Error:", error);
        throw new Error(`A network or unexpected error occurred: ${(error as Error).message}`);
    }
};
