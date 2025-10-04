// lib/class_inventory_entitlement.ts

import {
  ClassInventoryEntitlement,
  CreateClassInventoryEntitlementInput,
  UpdateClassInventoryEntitlementInput,
  ClassInventoryEntitlementFilters,
} from "@/lib/types/class_inventory_entitlement";

const BASE_URL = "/api/proxy/class_inventory_entitlements";

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

      // 401 check, handled by the server proxy response
      if (response.status === 401) {
        window.location.href = "/login";
      }

      throw new Error(errorData?.message || response.statusText);
    }

    // Handle 204 No Content - don't try to parse JSON
    if (response.status === 204) {
      return null;
    }

    // For all other successful responses, parse JSON
    return response.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

export const classInventoryEntitlementApi = {
  /**
   * Get all class inventory entitlements with optional filters
   */
  async getAll(
    filters?: ClassInventoryEntitlementFilters
  ): Promise<ClassInventoryEntitlement[]> {
    const query = new URLSearchParams(
      filters as Record<string, string>
    ).toString();
    const url = `${BASE_URL}${query ? `?${query}` : ""}`;
    return fetchProxy(url);
  },

  /**
   * Get a single class inventory entitlement by ID
   */
  async getById(id: string): Promise<ClassInventoryEntitlement> {
    const url = `${BASE_URL}/${id}`;
    return fetchProxy(url);
  },

  /**
   * Create a new class inventory entitlement
   */
  async create(
    data: CreateClassInventoryEntitlementInput
  ): Promise<ClassInventoryEntitlement> {
    return fetchProxy(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing class inventory entitlement
   */
  async update(
    id: string,
    data: UpdateClassInventoryEntitlementInput
  ): Promise<ClassInventoryEntitlement> {
    const url = `${BASE_URL}/${id}`;
    return fetchProxy(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a class inventory entitlement
   */
  async delete(id: string): Promise<void> {
    const url = `${BASE_URL}/${id}`;
    await fetchProxy(url, {
      method: "DELETE",
    });
  },

  /**
   * Bulk upsert class inventory entitlements
   * Upsert (insert or update) multiple entitlements at once
   * Records are matched on (class_id, inventory_item_id, session_term_id)
   */
  async bulkUpsert(
    data: CreateClassInventoryEntitlementInput[]
  ): Promise<ClassInventoryEntitlement[]> {
    const url = `${BASE_URL}/bulk_upsert`;
    return fetchProxy(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

