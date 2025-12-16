// lib/roles.ts
import {
    Role,
    CreateRolePayload,
    UpdateRolePayload
} from "./types/roles";

const BASE_URL = "/api/proxy/roles";

// Enhanced error interface
interface ApiErrorResponse {
    message?: string;
    error?: string;
    details?: string;
    field?: string;
    code?: string;
    validation_errors?: Array<{
        field: string;
        message: string;
    }>;
}

async function fetchProxy(url: string, options: RequestInit = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
            // credentials: "include", // Uncomment if using cookies
        });

        if (!response.ok) {
            const errorData: ApiErrorResponse = await response.json().catch(() => ({}));

            // Redirect to login on 401
            if (response.status === 401) {
                window.location.href = "/login";
                throw new Error("Your session has expired. Please log in again to continue.");
            }

            // Build detailed error message based on status code
            let errorMessage = "";
            
            switch (response.status) {
                case 400:
                    // Handle validation errors
                    if (errorData.validation_errors && errorData.validation_errors.length > 0) {
                        const fieldErrors = errorData.validation_errors
                            .map(err => `${err.field}: ${err.message}`)
                            .join('; ');
                        errorMessage = `Validation failed - ${fieldErrors}`;
                    } else {
                        errorMessage = errorData.message || errorData.details || "Invalid request. Please check your input and try again.";
                        if (errorData.field) {
                            errorMessage += ` (Issue with field: ${errorData.field})`;
                        }
                    }
                    break;
                    
                case 403:
                    errorMessage = "Access denied: You don't have permission to perform this action. Please contact your administrator.";
                    break;
                    
                case 404:
                    errorMessage = "Role not found. It may have been deleted or the code is incorrect.";
                    break;
                    
                case 409:
                    if (errorData.code || errorData.field === 'code') {
                        errorMessage = `A role with code "${errorData.code || 'this value'}" already exists. Please use a different role code.`;
                    } else {
                        errorMessage = errorData.message || "A role with this code already exists. Please use a unique role code.";
                    }
                    break;
                    
                case 422:
                    errorMessage = errorData.message || "Validation failed. Please verify all required fields are filled correctly.";
                    if (errorData.field) {
                        errorMessage += ` (Problem with: ${errorData.field})`;
                    }
                    break;
                    
                case 500:
                    errorMessage = "Server error occurred. Please try again later or contact support if the issue persists.";
                    break;
                    
                case 503:
                    errorMessage = "Service temporarily unavailable. Please wait a moment and try again.";
                    break;
                    
                default:
                    errorMessage = errorData.message || errorData.error || response.statusText || "An unexpected error occurred. Please try again.";
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
            throw new Error("Network error: Unable to connect to the server. Please check your internet connection and try again.");
        }
        
        // Generic fallback
        throw new Error("An unexpected error occurred. Please try again.");
    }
}

export const rolesApi = {
    /** Get all roles */
    async getAll(): Promise<Role[]> {
        try {
            return await fetchProxy(BASE_URL);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : "Failed to load roles. Please refresh the page and try again.");
        }
    },

    /** Get single role by code */
    async getByCode(code: string): Promise<Role> {
        try {
            return await fetchProxy(`${BASE_URL}/${code}`);
        } catch (err) {
            throw new Error(err instanceof Error ? err.message : `Failed to load role with code "${code}". Please try again.`);
        }
    },

    /** Create a new role */
    async create(data: CreateRolePayload): Promise<Role> {
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
            throw new Error("Failed to create role. Please verify all fields are correct and try again.");
        }
    },

    /** Update existing role */
    async update(code: string, data: UpdateRolePayload): Promise<Role> {
        try {
            const result = await fetchProxy(`${BASE_URL}/${code}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
            return result;
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error(`Failed to update role "${code}". Please check your input and try again.`);
        }
    },

    /** Delete a role */
    async delete(code: string): Promise<void> {
        try {
            await fetchProxy(`${BASE_URL}/${code}`, {
                method: "DELETE",
            });
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error(`Failed to delete role "${code}". The role may be in use by other records or already deleted.`);
        }
    },

    /** Bulk upsert roles if your backend supports it */
    async bulkUpsert(data: CreateRolePayload[]): Promise<Role[]> {
        try {
            const result = await fetchProxy(`${BASE_URL}/bulk_upsert`, {
                method: "POST",
                body: JSON.stringify(data),
            });
            return result;
        } catch (err) {
            if (err instanceof Error) {
                throw err;
            }
            throw new Error("Failed to bulk upsert roles. Please check your data and try again.");
        }
    },
};

export type { Role, CreateRolePayload, UpdateRolePayload };