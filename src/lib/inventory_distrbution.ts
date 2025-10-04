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
  
  export const inventoryDistributionApi = {
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
    async update(id: string, data: UpdateInventoryDistributionInput): Promise<InventoryDistribution> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  };