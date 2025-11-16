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

export const roleMenusApi = {
  /** Get all role-menu assignments */
  async getAll(): Promise<RoleMenu[]> {
    return fetchProxy(BASE_URL);
  },

  /** Get menus assigned to a specific role */
  async getByRoleCode(roleCode: string): Promise<RoleMenu[]> {
    return fetchProxy(`${BASE_URL}/role/${encodeURIComponent(roleCode)}`);
  },

  /** Get single role-menu assignment by ID */
  async getById(id: string): Promise<RoleMenu> {
    return fetchProxy(`${BASE_URL}/${id}`);
  },

  /** Assign a menu to a role */
  async create(data: CreateRoleMenuPayload): Promise<RoleMenu> {
    return fetchProxy(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update a role-menu assignment */
  async update(id: string, data: UpdateRoleMenuPayload): Promise<RoleMenu> {
    return fetchProxy(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Delete a role-menu assignment */
  async delete(id: string): Promise<void> {
    await fetchProxy(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },

  /** Assign multiple menus to a role */
  async bulkAssign(data: BulkRoleMenuPayload): Promise<RoleMenu[]> {
    return fetchProxy(`${BASE_URL}/bulk`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Menus API (if you need to fetch available menus)
export const menusApi = {
  async getAll(): Promise<Menu[]> {
    return fetchProxy("/api/proxy/menus");
  },
};