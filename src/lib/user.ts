import type {
    User,
    CreateUserInput,
    UpdateUserInput,
    AuthUser,
    CreateAuthUserResponse,
} from "@/lib/types/user";

const BASE_URL = "/api/proxy/users";
const AUTH_URL = "/api/proxy/auth";

/**
 * Transform raw public-profile user
 */
function transformUser(user: Partial<User> & { user_metadata?: Partial<User> }): User {
    return {
        ...user,
        id: user.id ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        name: user.name ?? user.user_metadata?.name ?? "",
        roles: user.roles ?? user.user_metadata?.roles ?? [],
        username: user.username,
        created_at: user.created_at,
        updated_at: user.updated_at,
    };
}

/**
 * Transform Supabase Auth user → Full User
 */
function transformAuthUser(authUser: AuthUser): User {
    return {
        id: authUser.id,
        email: authUser.email || "",
        phone: authUser.phone || "",
        name: authUser.user_metadata?.name || "",
        username: authUser.user_metadata?.username,
        roles: Array.isArray(authUser.user_metadata?.roles)
            ? authUser.user_metadata.roles
            : [],

        // Supabase Auth only has created_at & last_sign_in_at
   
    };
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
            const errorData = await response.json().catch(() => null);

            if (response.status === 401) {
                window.location.href = "/login";
                return;
            }

            throw new Error(errorData?.message || response.statusText);
        }

        return response.status === 204 ? null : response.json();
    } catch (err) {
        console.error("Fetch failed:", err);
        throw err;
    }
}

export const userApi = {
    /**
     * GET all Supabase Auth users
     */
    async getAll(): Promise<User[]> {
        const rawUsers = await fetchProxy(`${AUTH_URL}/users`) as AuthUser[];
        return rawUsers.map(transformAuthUser);
    },

    /**
     * GET user by ID (public profile)
     */
    async getById(id: string): Promise<User> {
        const rawUser = await fetchProxy(`${BASE_URL}/${id}`) as Partial<User>;
        return transformUser(rawUser);
    },

    /**
     * CREATE user (Supabase Auth)
     */
    async create(data: CreateUserInput): Promise<User> {
        const authData = {
            email: data.email,
            password: data.password,
            name: data.name,
            role_code: data.roles?.[0] || "USER", // must be a string
            email_confirm: true,
        };

        const response = await fetchProxy(`${AUTH_URL}/create-user`, {
            method: "POST",
            body: JSON.stringify(authData),
        }) as CreateAuthUserResponse;

        const user = response?.user;

        return {
            id: user?.id ?? "",
            email: user?.email ?? data.email,
            phone: user?.phone ?? data.phone ?? "",
            name: user?.user_metadata?.name ?? data.name,

            roles: user?.user_metadata?.roles ?? data.roles ?? [],

            created_at: user?.created_at ?? new Date().toISOString(),
            updated_at: user?.last_sign_in_at ?? user?.created_at ?? new Date().toISOString(),
        };
    },

    /**
     * UPDATE public profile user
     */
    async update(id: string, data: UpdateUserInput): Promise<User> {
        const updateData = { ...data };

        if (updateData.password === "") delete updateData.password;

        const rawUser = await fetchProxy(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(updateData),
        }) as Partial<User>;

        return transformUser(rawUser);
    },

    /**
     * DELETE user
     */
    async delete(id: string): Promise<void> {
        await fetchProxy(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
    },
};
