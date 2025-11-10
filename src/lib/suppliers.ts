// lib/suppliers.ts

import {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  SupplierBalance,
} from "@/lib/types/suppliers";

const BASE_URL = "/api/proxy/suppliers";

/**
 * Generic fetch wrapper for the proxy API
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
      const errorData = await response.json().catch(() => null);

      // Handle unauthorized case
      if (response.status === 401) {
        window.location.href = "/login";
      }

      throw new Error(errorData?.message || response.statusText);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

/**
 * Supplier API methods
 */
export const supplierApi = {
  /** Get all suppliers */
  async getAll(): Promise<Supplier[]> {
    return fetchProxy(BASE_URL);
  },

  /** Get supplier by ID */
  async getById(id: string): Promise<Supplier> {
    return fetchProxy(`${BASE_URL}/${id}`);
  },

  /** Create new supplier */
  async create(data: CreateSupplierPayload): Promise<Supplier> {
    return fetchProxy(BASE_URL, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update supplier */
  async update(id: string, data: UpdateSupplierPayload): Promise<Supplier> {
    return fetchProxy(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Delete supplier */
  async delete(id: string): Promise<void> {
    await fetchProxy(`${BASE_URL}/${id}`, { method: "DELETE" });
  },

  /** Get supplier balances */
  async getBalances(): Promise<SupplierBalance[]> {
    return fetchProxy(`${BASE_URL}/balances`);
  },
};
