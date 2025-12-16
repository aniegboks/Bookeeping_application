// lib/menus.ts
import {
    Menu,
    CreateMenuPayload,
    UpdateMenuPayload
} from "./types/menu";

const BASE_URL = "/api/proxy/menus";

// Enhanced error interface
interface ApiErrorResponse {
    message?: string;
    error?: string;
    details?: string;
    field?: string;
    code?: string;
}

async function fetchProxy(url: string, options: RequestInit = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        if (!response.ok) {
            const errorData: ApiErrorResponse = await response.json().catch(() => ({}));

            // Redirect to login on 401
            if (response.status === 401) {
                window.location.href = "/login";
                throw new Error("Your session has expired. Please log in again.");
            }

            // Build detailed error message
            let errorMessage = "";
            
            switch (response.status) {
                case 400:
                    errorMessage = errorData.message || errorData.details || "Invalid request. Please check your input.";
                    if (errorData.field) {
                        errorMessage += ` (Field: ${errorData.field})`;
                    }
                    break;
                case 403:
                    errorMessage = "You don't have permission to perform this action.";
                    break;
                case 404:
                    errorMessage = "The requested menu could not be found. It may have been deleted.";
                    break;
                case 409:
                    errorMessage = errorData.message || "A menu with this route already exists. Please use a different route.";
                    break;
                case 422:
                    errorMessage = errorData.message || "Validation failed. Please check your input.";
                    if (errorData.field) {
                        errorMessage += ` (Issue with: ${errorData.field})`;
                    }
                    break;
                case 500:
                    errorMessage = "Server error. Please try again later or contact support if the problem persists.";
                    break;
                case 503:
                    errorMessage = "Service temporarily unavailable. Please try again in a few moments.";
                    break;
                default:
                    errorMessage = errorData.message || errorData.error || response.statusText || "An unexpected error occurred.";
            }

            throw new Error(errorMessage);
        }

        if (response.status === 204 || options.method === "DELETE") {
            return null;
        }

        return response.json();
    } catch (err) {
        // If it's already our formatted error, rethrow it
        if (err instanceof Error) {
            throw err;
        }
        
        // Handle network errors
        if (err instanceof TypeError) {
            throw new Error("Network error. Please check your internet connection and try again.");
        }
        
        // Generic fallback
        throw new Error("An unexpected error occurred. Please try again.");
    }
}

export const menusApi = {
    /** Get all menus */
    async getAll(): Promise<Menu[]> {
        try {
            return await fetchProxy(BASE_URL);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : "Failed to load menus. Please refresh the page and try again.");
        }
    },

    /** Get single menu by ID */
    async getById(id: string): Promise<Menu> {
        try {
            return await fetchProxy(`${BASE_URL}/${id}`);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : `Failed to load menu (ID: ${id}). Please try again.`);
        }
    },

    /** Create a new menu */
    async create(data: CreateMenuPayload): Promise<Menu> {
        try {
            const result = await fetchProxy(BASE_URL, {
                method: "POST",
                body: JSON.stringify(data),
            });
            return result;
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error("Failed to create menu. Please check your input and try again.");
        }
    },

    /** Update existing menu */
    async update(id: string, data: UpdateMenuPayload): Promise<Menu> {
        try {
            const result = await fetchProxy(`${BASE_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            return result;
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error("Failed to update menu. Please check your input and try again.");
        }
    },

    /** Delete a menu */
    async delete(id: string): Promise<void> {
        try {
            await fetchProxy(`${BASE_URL}/${id}`, {
                method: "DELETE",
            });
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error("Failed to delete menu. The menu may be in use or already deleted.");
        }
    },
};

export type { Menu, CreateMenuPayload };