// lib/menus.ts
import {
    Menu,
    CreateMenuPayload,
    UpdateMenuPayload
} from "./types/menu";

const BASE_URL = "/api/proxy/menus";

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

export const menusApi = {
    /** Get all menus */
    async getAll(): Promise<Menu[]> {
        return fetchProxy(BASE_URL);
    },

    /** Get single menu by ID */
    async getById(id: string): Promise<Menu> {
        return fetchProxy(`${BASE_URL}/${id}`);
    },

    /** Create a new menu */
    async create(data: CreateMenuPayload): Promise<Menu> {
        return fetchProxy(BASE_URL, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    /** Update existing menu */
    async update(id: string, data: UpdateMenuPayload): Promise<Menu> {
        return fetchProxy(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    /** Delete a menu */
    async delete(id: string): Promise<void> {
        await fetchProxy(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    },
};

export type { Menu, CreateMenuPayload };