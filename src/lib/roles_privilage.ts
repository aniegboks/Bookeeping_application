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
            // credentials: "include", // Uncomment if using cookies
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            // Redirect to login on 401
            if (response.status === 401) {
                window.location.href = "/login";
            }

            throw new Error(errorData?.message || response.statusText);
        }

        if (response.status === 204 || options.method === "DELETE") {
            return null;
        }

        return response.json();
    } catch (err) {
        console.error("Fetch failed:", err);
        throw err;
    }
}

export const rolePrivilegesApi = {
    /** Get all role privileges, optionally filtered by role_code */
    async getAll(roleCode?: string): Promise<GroupedPrivileges | RolePrivilege[]> {
        const url = roleCode 
            ? `${BASE_URL}?role_code=${encodeURIComponent(roleCode)}`
            : BASE_URL;
        return fetchProxy(url);
    },

    /** Get single role privilege by ID */
    async getById(id: string): Promise<RolePrivilege> {
        return fetchProxy(`${BASE_URL}/${id}`);
    },

    /** Create a new role privilege */
    async create(data: CreateRolePrivilegePayload): Promise<RolePrivilege> {
        return fetchProxy(BASE_URL, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /** Update existing role privilege */
    async update(id: string, data: UpdateRolePrivilegePayload): Promise<RolePrivilege> {
        return fetchProxy(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /** Delete a role privilege */
    async delete(id: string): Promise<void> {
        await fetchProxy(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    },

    /** 
     * Upsert role privileges by role and description (legacy method)
     * Insert or update role privileges based on the provided role and privilege definitions.
     * Records are matched on the role and description combination.
     */
    async upsert(data: UpsertRolePrivilegesPayload): Promise<RolePrivilege[]> {
        return fetchProxy(`${BASE_URL}/upsert`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /** 
     * Bulk upsert role privileges
     * Insert or update multiple role privileges at once based on role_code and description
     */
    async bulkUpsert(data: BulkUpsertRolePrivilegesPayload): Promise<RolePrivilege[]> {
        return fetchProxy(`${BASE_URL}/upsert`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};