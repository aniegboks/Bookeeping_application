// lib/inventory_distribution.ts

import {
  InventoryDistribution,
  CreateInventoryDistributionInput,
  UpdateInventoryDistributionInput,
} from "@/lib/types/inventory_distribution";

// Base URL for distributions (not nested)
const BASE_URL = `/api/proxy/inventory_transactions/distributions`;

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

export const inventoryDistributionApi = {
  /**
   * Get all distributions
   */
  async getAll(): Promise<InventoryDistribution[]> {
    return fetchProxy(BASE_URL, { method: "GET" });
  },

  /**
   * Get a single distribution by ID
   */
  async getById(distributionId: string): Promise<InventoryDistribution> {
    const url = `${BASE_URL}/${distributionId}`;
    return fetchProxy(url, { method: "GET" });
  },

  /**
   * Create a new inventory distribution
   */
  async create(data: CreateInventoryDistributionInput): Promise<InventoryDistribution> {
    return fetchProxy(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing inventory distribution
   */
  async update(
    distributionId: string,
    data: UpdateInventoryDistributionInput
  ): Promise<InventoryDistribution> {
    const url = `${BASE_URL}/${distributionId}`;
    return fetchProxy(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an inventory distribution
   */
  async delete(distributionId: string): Promise<void> {
    const url = `${BASE_URL}/${distributionId}`;
    return fetchProxy(url, { method: "DELETE" });
  },
};
