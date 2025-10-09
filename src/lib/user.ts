import {
    User,
    CreateUserInput,
    UpdateUserInput,
} from "@/lib/types/user";

const BASE_URL = "/api/proxy/users";

/**
 * Transform raw user data (possibly coming from API) 
 * into a fully typed User object
 */
function transformUser(user: Partial<User> & { user_metadata?: Partial<User> }): User {
    return {
        ...user,
        id: user.id ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        name: user.name ?? user.user_metadata?.name ?? "",
        roles: user.roles ?? user.user_metadata?.roles ?? [],
        username: user.username, // optional
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
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
        const rawUsers = await fetchProxy(BASE_URL) as Partial<User>[];
        return rawUsers.map(transformUser);
    },

    /**
     * Get a single user by ID
     */
    async getById(id: string): Promise<User> {
        const rawUser = await fetchProxy(`${BASE_URL}/${id}`) as Partial<User>;
        return transformUser(rawUser);
    },

    /**
     * Create a new user
     */
    async create(data: CreateUserInput): Promise<User> {
        const rawUser = await fetchProxy(BASE_URL, {
            method: "POST",
            body: JSON.stringify(data),
        }) as Partial<User>;
        return transformUser(rawUser);
    },

    /**
     * Update an existing user
     */
    async update(id: string, data: UpdateUserInput): Promise<User> {
        const updateData = { ...data };
        if (updateData.password === "") {
            delete updateData.password;
        }

        const rawUser = await fetchProxy(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(updateData),
        }) as Partial<User>;

        return transformUser(rawUser);
    },

    /**
     * Delete a user
     */
    async delete(id: string): Promise<void> {
        await fetchProxy(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    },
};
