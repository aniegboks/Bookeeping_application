import type {
    User,
    CreateUserInput,
    UpdateUserInput,
    AuthUser,
    CreateAuthUserResponse,
} from "@/lib/types/user";

const BASE_URL = "/api/proxy/users";
const AUTH_URL = "/api/proxy/auth";

// Error details type for better type safety
interface ErrorDetails {
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

// Custom error class for better error handling
class UserApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = "UserApiError";
  }
}

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
            
            // Extract the actual error message from various possible formats
            const serverMessage = errorData?.message || errorData?.error || errorData?.detail;

            // Handle 401 Unauthorized
            if (response.status === 401) {
                window.location.href = "/login";
                throw new UserApiError(
                    serverMessage || "Session expired. Please log in again.",
                    401,
                    errorData
                );
            }

            // Handle 403 Forbidden
            if (response.status === 403) {
                throw new UserApiError(
                    serverMessage || "You don't have permission to perform this action.",
                    403,
                    errorData
                );
            }

            // Handle 404 Not Found
            if (response.status === 404) {
                throw new UserApiError(
                    serverMessage || "User not found.",
                    404,
                    errorData
                );
            }

            // Handle 409 Conflict (e.g., duplicate email)
            if (response.status === 409) {
                throw new UserApiError(
                    serverMessage || "A user with this email already exists.",
                    409,
                    errorData
                );
            }

            // Handle 422 Validation Error
            if (response.status === 422) {
                if (errorData?.errors) {
                    const validationDetails = Object.entries(errorData.errors)
                        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
                        .join("; ");
                    throw new UserApiError(
                        `Validation failed - ${validationDetails}`,
                        422,
                        errorData
                    );
                }
                throw new UserApiError(
                    serverMessage || "Invalid data provided.",
                    422,
                    errorData
                );
            }

            // Handle 400 Bad Request
            if (response.status === 400) {
                throw new UserApiError(
                    serverMessage || "Invalid request. Please check your input.",
                    400,
                    errorData
                );
            }

            // Handle 500 Server Error
            if (response.status >= 500) {
                const errorMsg = serverMessage 
                    ? `Server error: ${serverMessage}` 
                    : "Server error occurred. Please try again later or contact support if the problem persists.";
                throw new UserApiError(
                    errorMsg,
                    response.status,
                    errorData
                );
            }

            // Generic error for other status codes - always include server message
            throw new UserApiError(
                serverMessage || `Request failed with status ${response.status}`,
                response.status,
                errorData
            );
        }

        return response.status === 204 ? null : response.json();
    } catch (err) {
        // Re-throw UserApiError as-is
        if (err instanceof UserApiError) {
            throw err;
        }

        // Network errors or other fetch failures
        if (err instanceof TypeError && err.message.includes("fetch")) {
            throw new UserApiError(
                "Network error. Please check your internet connection and try again.",
                0
            );
        }

        // JSON parsing errors
        if (err instanceof SyntaxError) {
            throw new UserApiError(
                "Invalid response from server. Please try again.",
                0
            );
        }

        // Unknown errors
        console.error("Unexpected error:", err);
        throw new UserApiError(
            err instanceof Error ? err.message : "An unexpected error occurred.",
            0
        );
    }
}

export const userApi = {
    /**
     * GET all Supabase Auth users
     */
    async getAll(): Promise<User[]> {
        try {
            const rawUsers = await fetchProxy(`${AUTH_URL}/users`) as AuthUser[];
            return rawUsers.map(transformAuthUser);
        } catch (err) {
            if (err instanceof UserApiError) {
                throw new UserApiError(
                    `Failed to load users - ${err.message}`,
                    err.statusCode,
                    err.details
                );
            }
            throw err;
        }
    },

    /**
     * GET user by ID (public profile)
     */
    async getById(id: string): Promise<User> {
        try {
            const rawUser = await fetchProxy(`${BASE_URL}/${id}`) as Partial<User>;
            return transformUser(rawUser);
        } catch (err) {
            if (err instanceof UserApiError) {
                throw new UserApiError(
                    `Failed to load user details - ${err.message}`,
                    err.statusCode,
                    err.details
                );
            }
            throw err;
        }
    },

    /**
     * CREATE user (Supabase Auth)
     */
    async create(data: CreateUserInput): Promise<User> {
        try {
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
        } catch (err) {
            if (err instanceof UserApiError) {
                let contextMessage = "Failed to create user";
                
                if (err.statusCode === 409) {
                    contextMessage = `Cannot create user - email '${data.email}' is already registered`;
                } else if (err.statusCode === 422) {
                    contextMessage = `Cannot create user - ${err.message}`;
                } else if (err.statusCode === 400) {
                    // Common password/validation issues
                    if (err.message.toLowerCase().includes("password")) {
                        contextMessage = `Cannot create user - ${err.message}`;
                    } else {
                        contextMessage = `Cannot create user - ${err.message}`;
                    }
                } else {
                    contextMessage = `Failed to create user - ${err.message}`;
                }
                
                throw new UserApiError(
                    contextMessage,
                    err.statusCode,
                    err.details
                );
            }
            throw err;
        }
    },

    /**
     * UPDATE public profile user
     */
    async update(id: string, data: UpdateUserInput): Promise<User> {
        try {
            const updateData = { ...data };

            if (updateData.password === "") delete updateData.password;

            const rawUser = await fetchProxy(`${BASE_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(updateData),
            }) as Partial<User>;

            return transformUser(rawUser);
        } catch (err) {
            if (err instanceof UserApiError) {
                let contextMessage = "Failed to update user";
                
                if (err.statusCode === 404) {
                    contextMessage = "Cannot update user - user not found (may have been deleted)";
                } else if (err.statusCode === 409) {
                    contextMessage = data.email 
                        ? `Cannot update user - email '${data.email}' is already used by another user`
                        : "Cannot update user - this information is already used by another user";
                } else if (err.statusCode === 422) {
                    contextMessage = `Cannot update user - ${err.message}`;
                } else if (err.statusCode === 400) {
                    contextMessage = `Cannot update user - ${err.message}`;
                } else {
                    contextMessage = `Failed to update user - ${err.message}`;
                }
                
                throw new UserApiError(
                    contextMessage,
                    err.statusCode,
                    err.details
                );
            }
            throw err;
        }
    },

    /**
     * DELETE user
     */
    async delete(id: string): Promise<void> {
        try {
            await fetchProxy(`${BASE_URL}/${id}`, {
                method: "DELETE",
            });
        } catch (err) {
            if (err instanceof UserApiError) {
                let contextMessage = "Failed to delete user";
                
                if (err.statusCode === 404) {
                    contextMessage = "Cannot delete user - user not found (may have already been deleted)";
                } else if (err.statusCode === 409) {
                    contextMessage = "Cannot delete user - this user has associated records (created items, transactions, etc.). Remove or reassign those records first";
                } else if (err.statusCode === 403) {
                    contextMessage = "Cannot delete user - you cannot delete your own account or admin accounts";
                } else {
                    contextMessage = `Failed to delete user - ${err.message}`;
                }
                
                throw new UserApiError(
                    contextMessage,
                    err.statusCode,
                    err.details
                );
            }
            throw err;
        }
    },
};