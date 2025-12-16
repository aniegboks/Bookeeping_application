// lib/inventory_distribution.ts

import {
  InventoryDistribution,
  CreateInventoryDistributionInput,
  UpdateInventoryDistributionInput,
} from "@/lib/types/inventory_distribution";

const BASE_URL = "/api/proxy/inventory_transactions/distributions";

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
        throw new Error("Your session has expired. Please log in again.");
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error(
          errorData?.message || 
          "You don't have permission to perform this action. Please contact your administrator."
        );
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error(
          errorData?.message || 
          "The requested distribution record could not be found. It may have been deleted."
        );
      }

      // Handle 409 Conflict
      if (response.status === 409) {
        throw new Error(
          errorData?.message || 
          "This operation conflicts with existing data. Please check if this distribution already exists."
        );
      }

      // Handle 422 Validation Error
      if (response.status === 422) {
        const details = errorData?.details || errorData?.errors;
        if (details) {
          // If we have specific field errors, show them
          const fieldErrors = Array.isArray(details) 
            ? details.map(e => e.message || e).join(", ")
            : typeof details === "object"
            ? Object.entries(details).map(([field, msg]) => `${field}: ${msg}`).join(", ")
            : details;
          throw new Error(`Invalid information provided: ${fieldErrors}`);
        }
        throw new Error(
          errorData?.message || 
          "The information provided is invalid. Please check all required fields including quantity, class, item, and date."
        );
      }

      // Handle 400 Bad Request (insufficient inventory)
      if (response.status === 400) {
        throw new Error(
          errorData?.message || 
          "Unable to process this distribution. Please verify the inventory item has sufficient quantity available."
        );
      }

      // Handle 500 Server Error
      if (response.status === 500) {
        throw new Error(
          "An unexpected error occurred on the server. Please try again later or contact support if the problem persists."
        );
      }

      // Handle 503 Service Unavailable
      if (response.status === 503) {
        throw new Error(
          "The service is temporarily unavailable. Please try again in a few moments."
        );
      }

      // Generic error with details if available
      throw new Error(
        errorData?.message || 
        errorData?.error || 
        `Request failed with status ${response.status}. Please try again or contact support.`
      );
    }

    if (response.status === 204) return null;

    return response.json();
  } catch (err) {
    // If it's already our formatted error, rethrow it
    if (err instanceof Error) {
      throw err;
    }

    // Handle network errors
    if (err instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }

    // Generic fallback
    throw new Error(
      "An unexpected error occurred. Please try again or contact support if the problem persists."
    );
  }
}

export const inventoryDistributionApi = {
  /**
   * Get all inventory distributions with optional filters
   */
  async getAll(filters?: {
    class_id?: string;
    session_term_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: InventoryDistribution[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const params = new URLSearchParams();

      if (filters?.class_id) params.append("class_id", filters.class_id);
      if (filters?.session_term_id) params.append("session_term_id", filters.session_term_id);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const url = `${BASE_URL}/query?${params.toString()}`;
      return await fetchProxy(url);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to load distribution records: ${err.message}`);
      }
      throw new Error("Failed to load distribution records. Please refresh the page and try again.");
    }
  },

  /**
   * Create a new inventory distribution
   */
  async create(
    data: CreateInventoryDistributionInput
  ): Promise<InventoryDistribution> {
    try {
      return await fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof Error) {
        // Check for specific error patterns
        if (err.message.includes("insufficient") || err.message.includes("quantity")) {
          throw new Error(`Cannot distribute items: ${err.message}`);
        }
        if (err.message.includes("not found")) {
          throw new Error(`Distribution failed: The selected class or inventory item no longer exists. Please refresh and try again.`);
        }
        throw new Error(`Failed to create distribution: ${err.message}`);
      }
      throw new Error("Failed to create distribution record. Please check your input and try again.");
    }
  },

  /**
   * Update an existing inventory distribution
   */
  async update(
    id: string,
    data: UpdateInventoryDistributionInput
  ): Promise<InventoryDistribution> {
    try {
      const url = `${BASE_URL}/${id}`;
      return await fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (err) {
      if (err instanceof Error) {
        // Check for specific error patterns
        if (err.message.includes("insufficient") || err.message.includes("quantity")) {
          throw new Error(`Cannot update distribution: ${err.message}`);
        }
        if (err.message.includes("not found")) {
          throw new Error(`Update failed: This distribution record may have been deleted. Please refresh the page.`);
        }
        throw new Error(`Failed to update distribution: ${err.message}`);
      }
      throw new Error("Failed to update distribution record. Please check your changes and try again.");
    }
  },
};