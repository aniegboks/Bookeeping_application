// lib/inventory_transaction.ts

import {
    InventoryTransaction,
    CreateInventoryTransactionInput,
    UpdateInventoryTransactionInput,
  } from "@/lib/types/inventory_transactions";
  
  const BASE_URL = "/api/proxy/inventory_transactions";
  
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
  
  export const inventoryTransactionApi = {
    /**
     * Get all inventory transactions
     */
    async getAll(): Promise<InventoryTransaction[]> {
      return fetchProxy(BASE_URL);
    },
  
    /**
     * Get a single inventory transaction by ID
     */
    async getById(id: string): Promise<InventoryTransaction> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url);
    },
  
    /**
     * Create a new inventory transaction
     */
    async create(
      data: CreateInventoryTransactionInput
    ): Promise<InventoryTransaction> {
      return fetchProxy(BASE_URL, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Update an existing inventory transaction
     */
    async update(
      id: string,
      data: UpdateInventoryTransactionInput
    ): Promise<InventoryTransaction> {
      const url = `${BASE_URL}/${id}`;
      return fetchProxy(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  
    /**
     * Delete an inventory transaction
     */
    async delete(id: string): Promise<void> {
      const url = `${BASE_URL}/${id}`;
      await fetchProxy(url, {
        method: "DELETE",
      });
    },
  };