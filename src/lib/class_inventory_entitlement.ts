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

      // Handle 401 Unauthorized
      if (response.status === 401) {
        window.location.href = "/login";
        throw new Error("Your session has expired. Please log in again to continue.");
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error("You don't have permission to perform this action. Please contact your administrator if you believe this is an error.");
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error("The requested entitlement could not be found. It may have been deleted or moved.");
      }

      // Handle 409 Conflict (e.g., duplicate entries)
      if (response.status === 409) {
        throw new Error(errorData?.message || "This entitlement already exists. An entitlement with the same class, inventory item, and session term combination is already in the system.");
      }

      // Handle 422 Unprocessable Entity (validation errors)
      if (response.status === 422) {
        const validationMessage = errorData?.message || "The data you provided is invalid. Please check all required fields and try again.";
        throw new Error(validationMessage);
      }

      // Handle 500 Internal Server Error
      if (response.status === 500) {
        throw new Error("A server error occurred while processing your request. Please try again later or contact support if the problem persists.");
      }

      // Handle 503 Service Unavailable
      if (response.status === 503) {
        throw new Error("The service is temporarily unavailable. Please try again in a few moments.");
      }

      // Default error with status code
      const defaultMessage = errorData?.message || `Request failed with status ${response.status}. Please try again or contact support.`;
      throw new Error(defaultMessage);
    }

    // Handle 204 No Content - don't try to parse JSON
    if (response.status === 204) {
      return null;
    }

    // For all other successful responses, parse JSON
    return response.json();
  } catch (err) {
    // If it's already our custom error, rethrow it
    if (err instanceof Error) {
      throw err;
    }
    
    // Handle network errors
    if (err instanceof TypeError) {
      throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
    }
    
    // Generic fallback
    throw new Error("An unexpected error occurred. Please try again or contact support if the problem continues.");
  }
}

export const classInventoryEntitlementApi = {
  /**
   * Get all class inventory entitlements with optional filters
   */
  async getAll(
    filters?: ClassInventoryEntitlementFilters
  ): Promise<ClassInventoryEntitlement[]> {
    try {
      const query = new URLSearchParams(
        filters as Record<string, string>
      ).toString();
      const url = `${BASE_URL}${query ? `?${query}` : ""}`;
      return await fetchProxy(url);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to load entitlements: ${err.message}`);
      }
      throw new Error("Failed to load entitlements. Please refresh the page and try again.");
    }
  },

  /**
   * Get a single class inventory entitlement by ID
   */
  async getById(id: string): Promise<ClassInventoryEntitlement> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to load entitlement details: ${err.message}`);
      }
      throw new Error("Failed to load entitlement details. Please try again.");
    }
  },

  /**
   * Create a new class inventory entitlement
   */
  async create(
    data: CreateClassInventoryEntitlementInput
  ): Promise<ClassInventoryEntitlement> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to create entitlement: ${err.message}`);
      }
      throw new Error("Failed to create entitlement. Please verify all fields are filled correctly and try again.");
    }
  },

  /**
   * Update an existing class inventory entitlement
   */
  async update(
    id: string,
    data: UpdateClassInventoryEntitlementInput
  ): Promise<ClassInventoryEntitlement> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to update entitlement: ${err.message}`);
      }
      throw new Error("Failed to update entitlement. Please verify all fields are correct and try again.");
    }
  },

  /**
   * Delete a class inventory entitlement
   */
  async delete(id: string): Promise<void> {
    try {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to delete entitlement: ${err.message}`);
      }
      throw new Error("Failed to delete entitlement. Please try again or contact support if the issue continues.");
    }
  },

  /**
   * Bulk upsert class inventory entitlements
   * Upsert (insert or update) multiple entitlements at once
   * Records are matched on (class_id, inventory_item_id, session_term_id)
   */
  async bulkUpsert(
    data: CreateClassInventoryEntitlementInput[]
  ): Promise<ClassInventoryEntitlement[]> {
    try {
      const url = `${BASE_URL}/bulk_upsert`;
      return await fetchProxy(url, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to upload entitlements: ${err.message}`);
      }
      throw new Error(`Failed to upload ${data.length} entitlements. Please check your data format and try again.`);
    }
  },
};