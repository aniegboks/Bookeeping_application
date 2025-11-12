// lib/roles.ts
import {
    Role,
    CreateRolePayload,
    UpdateRolePayload
} from "./types/roles";

const BASE_URL = "/api/proxy/roles";

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

export const rolesApi = {
    /** Get all roles */
    async getAll(): Promise<Role[]> {
        return fetchProxy(BASE_URL);
    },

    /** Get single role by code */
    async getByCode(code: string): Promise<Role> {
        return fetchProxy(`${BASE_URL}/${code}`);
    },

    /** Create a new role */
    async create(data: CreateRolePayload): Promise<Role> {
        return fetchProxy(BASE_URL, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /** Update existing role */
    async update(code: string, data: UpdateRolePayload): Promise<Role> {
        return fetchProxy(`${BASE_URL}/${code}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /** Delete a role */
    async delete(code: string): Promise<void> {
        await fetchProxy(`${BASE_URL}/${code}`, {
            method: "DELETE",
        });
    },

    /** Optional: Bulk upsert roles if your backend supports it */
    async bulkUpsert(data: CreateRolePayload[]): Promise<Role[]> {
        return fetchProxy(`${BASE_URL}/bulk_upsert`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },
};
