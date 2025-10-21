import {
  InventorySummary,
  TransactionSummary,
  TransactionType,
  DistributionSummary, // Add this type
} from "@/lib/types/inventory_summary";

const BASE_URL = "/api/proxy/inventory_summary";

/**
 * Helper to fetch from proxy API with proper error handling.
 */
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
      // Try to parse backend error (could be { error } or { message })
      const errorData = await response.json().catch(() => null);
      
      const errorMessage =
        errorData?.message ||
        errorData?.error || // handle "error" key (common in Rust/Go APIs)
        `Request failed with status ${response.status}`;
      
      console.error("Proxy Error:", response.status, errorMessage);
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null; // No content
    }

    return response.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

export const inventorySummaryApi = {
  async getById(inventoryId: string): Promise<InventorySummary> {
    const url = `${BASE_URL}/${inventoryId}`;
    return fetchProxy(url);
  },

  async getBulk(inventoryIds: string[]): Promise<InventorySummary[]> {
    const url = `${BASE_URL}/bulk`;
    return fetchProxy(url, {
      method: "POST",
      body: JSON.stringify({ inventory_ids: inventoryIds }),
    });
  },

  /**
   * Get transaction summary by type for an inventory item
   */
  async getTransactionSummary(
    inventoryId: string,
    transactionType: TransactionType
  ): Promise<TransactionSummary> {
    const url = `${BASE_URL}/${inventoryId}/transactions/${transactionType}`;
    return fetchProxy(url);
  },

  /**
   * Get all low-stock inventory items
   */
  async getLowStock(): Promise<InventorySummary[]> {
    const url = `${BASE_URL}/low/stock`;
    return fetchProxy(url);
  },

  // ⬇️ MISSING ENDPOINT ⬇️
  /**
   * Get distribution summary for class inventory and student logs
   */
  async getDistributionCollection(params?: {
    inventory_item_id?: string;
    class_id?: string;
    session_term_id?: string;
    teacher_id?: string;
  }): Promise<DistributionSummary[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.inventory_item_id) {
      queryParams.append("inventory_item_id", params.inventory_item_id);
    }
    if (params?.class_id) {
      queryParams.append("class_id", params.class_id);
    }
    if (params?.session_term_id) {
      queryParams.append("session_term_id", params.session_term_id);
    }
    if (params?.teacher_id) {
      queryParams.append("teacher_id", params.teacher_id);
    }

    const url = `${BASE_URL}/distribution-collection/query${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return fetchProxy(url);
  },
};