// lib/role-menus.ts
import {
  RoleMenu,
  CreateRoleMenuPayload,
  UpdateRoleMenuPayload,
  BulkRoleMenuPayload,
  Menu,
} from "./types/roles_menu";

const BASE_URL = "/api/proxy/role_menus";

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
          errorData?.message || "The requested resource was not found. It may have been deleted."
        );
      }

      // Handle conflict errors (e.g., duplicate assignments)
      if (response.status === 409) {
        throw new Error(
          errorData?.message || "This menu is already assigned to the role. Please select a different menu."
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

export const roleMenusApi = {
  /** Get all role-menu assignments */
  async getAll(): Promise<RoleMenu[]> {
    try {
      return await fetchProxy(BASE_URL);
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : "Failed to load role menu assignments. Please refresh the page and try again."
      );
    }
  },

  /** Get menus assigned to a specific role */
  async getByRoleCode(roleCode: string): Promise<RoleMenu[]> {
    try {
      return await fetchProxy(`${BASE_URL}/role/${encodeURIComponent(roleCode)}`);
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : `Failed to load menus for role ${roleCode}. Please try again.`
      );
    }
  },

  /** Get single role-menu assignment by ID */
  async getById(id: string): Promise<RoleMenu> {
    try {
      return await fetchProxy(`${BASE_URL}/${id}`);
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : "Failed to load menu assignment details. Please try again."
      );
    }
  },

  /** Assign a menu to a role */
  async create(data: CreateRoleMenuPayload): Promise<RoleMenu> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : "Failed to assign menu to role. Please verify your input and try again."
      );
    }
  },

  /** Update a role-menu assignment */
  async update(id: string, data: UpdateRoleMenuPayload): Promise<RoleMenu> {
    try {
      return await fetchProxy(`${BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : "Failed to update menu assignment. Please verify your changes and try again."
      );
    }
  },

  /** Delete a role-menu assignment */
  async delete(id: string): Promise<void> {
    try {
      await fetchProxy(`${BASE_URL}/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : "Failed to remove menu assignment. Please try again or check if it has already been deleted."
      );
    }
  },

  /** Assign multiple menus to a role */
  async bulkAssign(data: BulkRoleMenuPayload): Promise<RoleMenu[]> {
    try {
      return await fetchProxy(`${BASE_URL}/bulk`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : "Failed to bulk assign menus. Some menus may already be assigned. Please review your selection and try again."
      );
    }
  },
};

// Menus API (if you need to fetch available menus)
export const menusApi = {
  async getAll(): Promise<Menu[]> {
    try {
      return await fetchProxy("/api/proxy/menus");
    } catch (err) {
      throw new Error(
        err instanceof Error 
          ? err.message 
          : "Failed to load available menus. Please refresh the page and try again."
      );
    }
  },
};