// lib/user.ts

import {
    User,
    CreateUserInput,
    UpdateUserInput,
} from "@/lib/types/user";

const BASE_URL = "/api/proxy/users";


function transformUser(user: any): User {
    if (user.name !== undefined && user.roles !== undefined) {
        return user;
    }

    return {
        ...user,
        name: user.user_metadata?.name || "", 
       
        roles: user.user_metadata?.roles || [],
    } as User; 
}

// --- END: DATA TRANSFORMATION FIX ---


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

            if (response.status === 401) {
                window.location.href = "/login";
            }

            throw new Error(errorData?.message || response.statusText);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    } catch (err) {
        console.error("Fetch failed:", err);
        throw err;
    }
}

export const userApi = {
    /**
     * Get all users
     */
    async getAll(): Promise<User[]> {
        const rawUsers = await fetchProxy(BASE_URL);
        // Apply transformation to the array of users
        return rawUsers.map(transformUser);
    },

    /**
     * Get a single user by ID
     */
    async getById(id: string): Promise<User> {
        const url = `${BASE_URL}/${id}`;
        const rawUser = await fetchProxy(url);
        // Apply transformation to the single user
        return transformUser(rawUser);
    },

    /**
     * Create a new user
     */
    async create(data: CreateUserInput): Promise<User> {
        const rawUser = await fetchProxy(BASE_URL, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return transformUser(rawUser);
    },

    /**
     * Update an existing user
     */
    async update(id: string, data: UpdateUserInput): Promise<User> {
        const url = `${BASE_URL}/${id}`;
        
        const updateData = { ...data };
        if (updateData.password === "") {
            delete updateData.password;
        }
        
        const rawUser = await fetchProxy(url, {
            method: "PUT",
            body: JSON.stringify(updateData),
        });
        return transformUser(rawUser);
    },

    /**
     * Delete a user
     */
    async delete(id: string): Promise<void> {
        const url = `${BASE_URL}/${id}`;
        await fetchProxy(url, {
            method: "DELETE",
        });
    },
};