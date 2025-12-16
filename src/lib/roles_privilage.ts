// lib/role-privileges.ts
import {
    RolePrivilege,
    CreateRolePrivilegePayload,
    UpdateRolePrivilegePayload,
    UpsertRolePrivilegesPayload,
    BulkUpsertRolePrivilegesPayload,
    GroupedPrivileges
} from "./types/roles_privilage";

const BASE_URL = "/api/proxy/role_privileges";

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
            const errorData = await response.json().catch(() => null);

            // Handle authentication errors
            if (response.status === 401) {
                window.location.href = "/login";
                throw new Error("Your session has expired. Please log in again.");
            }

            // Handle authorization errors
            if (response.status === 403) {
                throw new Error(
                    errorData?.message || "You do not have permission to perform this action. Please contact your administrator."
                );
            }

            // Handle validation errors
            if (response.status === 400) {
                const message = errorData?.message || "Invalid request data.";
                const details = errorData?.details 
                    ? ` Details: ${JSON.stringify(errorData.details)}`
                    : "";
                throw new Error(`${message}${details}`);
            }

            // Handle not found errors
            if (response.status === 404) {
                throw new Error(
                    errorData?.message || "The requested privilege was not found. It may have been deleted."
                );
            }

            // Handle conflict errors (e.g., duplicate privileges)
            if (response.status === 409) {
                throw new Error(
                    errorData?.message || "This privilege already exists for the role. Please modify the existing privilege instead."
                );
            }

            // Handle server errors
            if (response.status >= 500) {
                throw new Error(
                    "Server error occurred. Please try again later or contact support if the problem persists."
                );
            }

            // Generic error with status code
            throw new Error(
                errorData?.message || `Request failed with status ${response.status}. Please try again.`
            );
        }

        if (response.status === 204 || options.method === "DELETE") {
            return null;
        }

        return response.json();
    } catch (err) {
        // Re-throw if it's already our custom error
        if (err instanceof Error) {
            throw err;
        }
        
        // Network or unexpected errors
        throw new Error(
            "Network error occurred. Please check your internet connection and try again."
        );
    }
}

export const rolePrivilegesApi = {
    /** Get all role privileges, optionally filtered by role_code */
    async getAll(roleCode?: string): Promise<GroupedPrivileges | RolePrivilege[]> {
        try {
            const url = roleCode 
                ? `${BASE_URL}?role_code=${encodeURIComponent(roleCode)}`
                : BASE_URL;
            return await fetchProxy(url);
        } catch (err) {
            throw new Error(
                err instanceof Error 
                    ? err.message 
                    : roleCode
                        ? `Failed to load privileges for role ${roleCode}. Please try again.`
                        : "Failed to load role privileges. Please refresh the page and try again."
            );
        }
    },

    /** Get single role privilege by ID */
    async getById(id: string): Promise<RolePrivilege> {
        try {
            return await fetchProxy(`${BASE_URL}/${id}`);
        } catch (err) {
            throw new Error(
                err instanceof Error 
                    ? err.message 
                    : "Failed to load privilege details. Please try again."
            );
        }
    },

    /** Create a new role privilege */
    async create(data: CreateRolePrivilegePayload): Promise<RolePrivilege> {
        try {
            return await fetchProxy(BASE_URL, {
                method: "POST",
                body: JSON.stringify(data),
            });
        } catch (err) {
            throw new Error(
                err instanceof Error 
                    ? err.message 
                    : "Failed to create privilege. Please verify your input and try again."
            );
        }
    },

    /** Update existing role privilege */
    async update(id: string, data: UpdateRolePrivilegePayload): Promise<RolePrivilege> {
        try {
            return await fetchProxy(`${BASE_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        } catch (err) {
            throw new Error(
                err instanceof Error 
                    ? err.message 
                    : "Failed to update privilege. Please verify your changes and try again."
            );
        }
    },

    /** Delete a role privilege */
    async delete(id: string): Promise<void> {
        try {
            await fetchProxy(`${BASE_URL}/${id}`, {
                method: "DELETE",
            });
        } catch (err) {
            throw new Error(
                err instanceof Error 
                    ? err.message 
                    : "Failed to delete privilege. Please try again or check if it has already been removed."
            );
        }
    },

    /** 
     * Upsert role privileges by role and description (legacy method)
     * Insert or update role privileges based on the provided role and privilege definitions.
     * Records are matched on the role and description combination.
     */
    async upsert(data: UpsertRolePrivilegesPayload): Promise<RolePrivilege[]> {
        try {
            return await fetchProxy(`${BASE_URL}/upsert`, {
                method: "POST",
                body: JSON.stringify(data),
            });
        } catch (err) {
            throw new Error(
                err instanceof Error 
                    ? err.message 
                    : "Failed to upsert privileges. Please verify your data and try again."
            );
        }
    },

    /** 
     * Bulk upsert role privileges
     * Insert or update multiple role privileges at once based on role_code and description
     */
    async bulkUpsert(data: BulkUpsertRolePrivilegesPayload): Promise<RolePrivilege[]> {
        try {
            return await fetchProxy(`${BASE_URL}/upsert`, {
                method: "POST",
                body: JSON.stringify(data),
            });
        } catch (err) {
            throw new Error(
                err instanceof Error 
                    ? err.message 
                    : "Failed to bulk upsert privileges. Some privileges may already exist or have invalid data. Please review your input and try again."
            );
        }
    },
};